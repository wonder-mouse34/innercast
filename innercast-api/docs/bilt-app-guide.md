# Using the InnerCast API from a Bilt app

The Bilt app never talks to Qwen and never contains the knowledge graph. All the smart work happens in the
**InnerCast API** (this folder, running on a Linux server). Bilt only needs:

1. a **server automation** that forwards the user's message to the InnerCast API (the keys stay on Bilt's
   server, never in the app), and
2. a **chat screen** that shows the answer (it is Markdown).

## Before you start (these are not Bilt messages)

1. The InnerCast API is running (see the README, _Deploy on a Linux server_) and you have:
   - its **address**: `INNERCAST_URL.txt` on the server, e.g. `https://something.trycloudflare.com`
   - its **key**: the `INNERCAST_API_KEY=ic-...` line in `qwen_credentials.env` on the server
2. Check it works: open `<address>/health` in a browser. It should show `{"ok": true, "shows": 28, ...}`.
3. In Bilt: **Settings → Database → under "Bilt-managed backend" click Enable** (takes about a minute).

Then send the messages below **one at a time** (Bilt works best with one change per message). Wait for
each build to finish and check the live preview before sending the next one.

---

### Message 1 — the app and its screens

Build a mobile app called InnerCast for people going through a life change, like a new job, a breakup,
grief, moving, or family trouble. The user describes what they are going through in their own words, and
InnerCast recommends TV characters whose story mirrors theirs, without spoilers. Screens:

1. Chat (home screen): a conversation with InnerCast, with a text box and a send button at the bottom.
2. About: explains what InnerCast is, and shows this note: "InnerCast is for entertainment and reflection,
   not mental-health treatment. If you are in crisis, please contact local emergency services or a crisis
   line: 988 in the US, 116 123 in the UK and Ireland, 112 in the EU."
   For now, reply to every chat message with the placeholder text "InnerCast is thinking about this…".

### Message 2 — the two secrets

Add two server secrets for the backend:
INNERCAST_URL = PASTE THE ADDRESS FROM INNERCAST_URL.txt HERE
INNERCAST_API_KEY = PASTE THE ic-... KEY FROM qwen_credentials.env HERE
Use them only inside server automations. Never bundle them into the app.

(If Bilt shows a Secrets page in Settings, add the two secrets there instead and skip this message.)

### Message 3 — the server automation

Create a server automation called askInnerCast.
Input: {"message": string, "history": array}.
It sends a POST request to INNERCAST_URL + "/answer" with the headers "Content-Type: application/json" and
"X-API-Key: " + INNERCAST_API_KEY, and the JSON body {"message": message, "history": history}.
It waits up to 90 seconds for the reply.
On success it returns the reply unchanged: {"answer": string (Markdown), "history": array, "seconds": number}.
If the request fails, times out, or the reply contains an "error" field, it returns
{"error": "InnerCast couldn't answer right now. Please try again."}.
It must not call any other AI service.

### Message 4 — connect the chat to the automation

On the Chat screen, when the user sends a message: show their message right away, disable the send
button, and show a typing indicator with the text "Finding characters for you…" (answers take 5 to 30
seconds). Call the askInnerCast automation with the message and the history returned by the previous
answer (an empty list for the first message). Show the returned answer as InnerCast's chat bubble and keep
the returned history for the next message. If it returns an error, show the error text in the chat with a
"Try again" button that sends the same message again.

### Message 5 — show answers as Markdown

On the Chat screen, render InnerCast's answers as Markdown: headings (##), bold, italics, bullet lists,
block quotes (>) and horizontal rules (---). Long answers must scroll inside the chat and never be cut off.

### Message 6 — welcome and example messages

On the Chat screen, when there are no messages yet, show a short welcome: "Tell me what you're going
through, and I'll find a TV character who has lived it — no spoilers." Below it, show three tappable
example messages that send themselves when tapped:

- "I just got promoted to lead my old friends and I feel like a fraud."
- "My friend and my boss had a fight and I don't know whose side to take."
- "I moved to a new city and I'm lonely."

### Message 7 — new conversation

On the Chat screen, add a "New conversation" button in the header that clears the messages and the stored
history.

### Message 8 — design

Make the design calm and warm, like a cosy evening of TV: dark navy background, soft gold accents, rounded
chat bubbles, generous spacing and easy-to-read font sizes.

### Optional message 9 — save conversations

Enable sign-in with email, Apple and Google. Save each conversation (its messages and history) in the
database for the signed-in user, and add a History screen that lists past conversations by date; tapping
one reopens it.

---

## If something goes wrong

- **The app shows "InnerCast couldn't answer right now"**: open `<address>/health` in a browser. If it does
  not show `"ok": true`, the API or the tunnel on the Linux machine is down. Restart it there
  (`./start_innercast.sh`). The address changes on every restart, so update the INNERCAST_URL secret
  (send Message 2 again with the new address).
- **401 in the automation logs** (Bilt → Automations tab → invocation logs): the INNERCAST_API_KEY secret
  does not match the one in `qwen_credentials.env` on the Linux machine.
- **Timeouts**: a normal answer takes 5–30 s (German or other languages up to ~30 s). The automation must
  wait at least 60–90 s.
- **Do not** ask Bilt to call Qwen directly or to add `graph.json` to the app: the API already has both, and
  the Qwen key must not end up inside the app.

## Reference: the InnerCast API (give this to Bilt if it asks for details)

```
GET  <INNERCAST_URL>/health
     -> {"ok": true, "shows": 28, "characters": 237, "arcs": 489}          (no key needed)

POST <INNERCAST_URL>/answer
     headers: Content-Type: application/json
              X-API-Key: <INNERCAST_API_KEY>
     body:    {"message": "I just got promoted...", "history": []}
              "history": send back the "history" from the previous answer to continue the conversation
     -> 200 {"answer": "<Markdown text>", "history": [...], "seconds": 8.1}
     -> 400 {"error": "..."}  bad request (empty message, longer than 2000 characters, not JSON)
     -> 401 {"error": "..."}  wrong or missing X-API-Key
     -> 502 {"error": "..."}  Qwen or server problem, try again
```

A crisis message gets a caring reply with crisis-line numbers instead of recommendations; a vague message
("hi") gets one question back. Both come back as a normal "answer", so the app shows them like any other.
