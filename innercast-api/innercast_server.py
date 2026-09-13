"""InnerCast HTTP API: wraps qwen_agent.InnerCastAgent so an app (e.g. a Bilt automation) can call it.

Endpoints
  GET  /health   -> {"ok": true, "shows": 28, "characters": 237, "arcs": 489}
  GET  /options  -> the button labels the API understands: {"situations": [...], "genres": [{"label", "shows"}]}
  POST /answer   -> {"answer": "<markdown>", "history": [...], "seconds": 8.1}
       headers: Content-Type: application/json
                X-API-Key: <INNERCAST_API_KEY from qwen_credentials.env>
       body:    {"message": "I just got promoted...", "history": [...], "situations": [...], "genres": [...]}
                "history" optional: send back the "history" from the previous answer to continue the conversation.
                "situations" / "genres" optional: labels of the tapped buttons (buttons.json). "message" may be
                empty when at least one situation button was tapped.

Errors: 400 bad request, 401 wrong key, 413 too large, 502 Qwen/server problem ({"error": "..."}).
CORS is open so a web preview can call it too.

Run (Python 3.9+, no extra packages):
  python3 innercast_server.py                  # port 8787 on all interfaces
  INNERCAST_PORT=9000 python3 innercast_server.py
The Qwen API key never leaves this machine.
"""
import json
import os
import time
import traceback
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import qwen_tools as T
from qwen_agent import BUTTONS, InnerCastAgent, load_creds

CFG = load_creds()
API_KEY = os.environ.get("INNERCAST_API_KEY") or CFG.get("INNERCAST_API_KEY")
PORT = int(os.environ.get("INNERCAST_PORT", "8787"))
MAX_MESSAGE_CHARS = 2000
MAX_BODY_BYTES = 200_000
MAX_HISTORY = 10  # messages kept from earlier turns
COUNTS = T.GRAPH["meta"]["counts"]


def log(msg):
    print(datetime.now().strftime("%H:%M:%S"), msg, flush=True)


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-API-Key, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send(200, {})

    def do_GET(self):
        if self.path.split("?")[0].rstrip("/") == "/options":
            return self._send(200, {"situations": list(BUTTONS["situations"]),
                                    "genres": [{"label": g, "shows": len(v)} for g, v in BUTTONS["genres"].items()]})
        if self.path.split("?")[0].rstrip("/") in ("", "/health"):
            self._send(200, {"ok": True, "shows": COUNTS["show"], "characters": COUNTS["character"],
                             "arcs": COUNTS["arc"]})
        else:
            self._send(404, {"error": "not found"})

    def do_POST(self):
        if self.path.split("?")[0].rstrip("/") != "/answer":
            return self._send(404, {"error": "not found"})
        key = self.headers.get("X-API-Key") or self.headers.get("Authorization", "").replace("Bearer ", "").strip()
        if API_KEY and key != API_KEY:
            return self._send(401, {"error": "wrong or missing X-API-Key"})
        length = int(self.headers.get("Content-Length") or 0)
        if length > MAX_BODY_BYTES:
            return self._send(413, {"error": "request too large"})
        try:
            data = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            return self._send(400, {"error": "body must be JSON"})
        message = str(data.get("message") or "").strip()
        buttons = {}
        for k, limit in (("situations", 30), ("genres", 20)):
            v = data.get(k) or []
            if not isinstance(v, list) or not all(isinstance(x, str) for x in v):
                return self._send(400, {"error": f"'{k}' must be a list of button labels"})
            buttons[k] = [x.strip()[:60] for x in v if x.strip()][:limit]
        if not message and not buttons["situations"]:
            return self._send(400, {"error": "send a 'message' or at least one situation button"})
        if len(message) > MAX_MESSAGE_CHARS:
            return self._send(400, {"error": f"'message' is longer than {MAX_MESSAGE_CHARS} characters"})
        history = [{"role": m["role"], "content": str(m["content"])[:4000]}
                   for m in (data.get("history") or []) if isinstance(m, dict)
                   and m.get("role") in ("user", "assistant") and m.get("content")][-MAX_HISTORY:]
        t0 = time.time()
        try:
            r = InnerCastAgent().answer(message, history=history, **buttons)  # one agent per request: thread-safe
        except Exception:
            log("ERROR " + traceback.format_exc().splitlines()[-1])
            return self._send(502, {"error": "InnerCast could not answer right now. Please try again."})
        secs = round(time.time() - t0, 1)
        log(f"answer {secs}s, {len(r['answer'])} chars, guards={len(r['guards'])}")
        self._send(200, {"answer": r["answer"], "history": r["history"], "seconds": secs})

    def log_message(self, fmt, *args):  # quieter default logging
        log(f"{self.address_string()} {fmt % args}")


if __name__ == "__main__":
    if not API_KEY:
        log("WARNING: no INNERCAST_API_KEY set - the API is open to anyone who knows the address")
    log(f"InnerCast API on port {PORT} ({COUNTS['show']} shows, {COUNTS['arc']} arcs)")
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
