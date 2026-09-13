#!/usr/bin/env bash
# One-time setup of the InnerCast API on a Linux machine. Run from inside this folder:  ./setup_linux.sh
# Needs: Python 3.9+ and curl. No other packages. Downloads cloudflared (for the public HTTPS address) into bin/.
set -e
cd "$(dirname "$0")"

command -v python3 >/dev/null || { echo "Python 3 is missing: sudo apt install python3"; exit 1; }
python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 9) else 1)' || { echo "Python 3.9 or newer is needed"; exit 1; }
command -v curl >/dev/null || { echo "curl is missing: sudo apt install curl"; exit 1; }
mkdir -p bin logs

case "$(uname -m)" in
  x86_64|amd64) ARCH=amd64 ;;
  aarch64|arm64) ARCH=arm64 ;;
  armv7l|armv6l) ARCH=arm ;;
  *) echo "Unknown CPU type $(uname -m): download cloudflared for it into bin/ yourself"; exit 1 ;;
esac
if [ ! -x bin/cloudflared ]; then
  echo "Downloading cloudflared ($ARCH)..."
  curl -fsSL -o bin/cloudflared "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-$ARCH"
  chmod +x bin/cloudflared
fi
bin/cloudflared --version

if [ ! -f graph.json ] && [ -f ../build-knowledge-graph/qwen_server/graph.json ]; then
  cp ../build-knowledge-graph/qwen_server/graph.json graph.json   # deployed from the repo: keep a local copy
  echo "Copied graph.json from ../build-knowledge-graph/qwen_server/"
fi
[ -f graph.json ] || echo "NOTE: no graph.json here - qwen_tools.py will look in ../build-knowledge-graph/qwen_server/ or INNERCAST_GRAPH"

if [ ! -f qwen_credentials.env ]; then
  cp qwen_credentials.env.example qwen_credentials.env
  echo "Created qwen_credentials.env from the example - put the Qwen key in QWEN_API_KEY."
fi
if ! grep -q '^INNERCAST_API_KEY=ic-' qwen_credentials.env; then
  KEY="ic-$(python3 -c 'import secrets; print(secrets.token_hex(20))')"
  sed -i '/^INNERCAST_API_KEY=/d' qwen_credentials.env
  echo "INNERCAST_API_KEY=$KEY" >> qwen_credentials.env
  echo "Generated a new INNERCAST_API_KEY (in qwen_credentials.env)."
fi
chmod 600 qwen_credentials.env
chmod +x start_innercast.sh test_api.sh install_service.sh

python3 -c "import qwen_agent; qwen_agent.InnerCastAgent(); print('InnerCast code and graph load OK')"
echo "Checking the Qwen server..."
python3 - <<'PY'
import json, urllib.request
from qwen_agent import load_creds, CTX
c = load_creds()
req = urllib.request.Request(c["QWEN_BASE_URL"].rstrip("/") + "/models",
                             headers={"Authorization": f"Bearer {c['QWEN_API_KEY']}"})
try:
    models = [m["id"] for m in json.load(urllib.request.urlopen(req, timeout=20, context=CTX)).get("data", [])]
    print("Qwen server reachable, models:", models)
    if c["QWEN_MODEL"] not in models:
        print("WARNING: QWEN_MODEL", c["QWEN_MODEL"], "is not in that list")
except Exception as e:
    print("WARNING: cannot reach the Qwen server:", e)
PY
echo "Setup done. Next: ./start_innercast.sh"
