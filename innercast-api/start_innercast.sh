#!/usr/bin/env bash
# Start the InnerCast API and a public HTTPS address for it (Cloudflare quick tunnel: free, no account).
# The address is saved in INNERCAST_URL.txt (this folder). Put it into the INNERCAST_URL secret in Bilt.
# NOTE: a quick-tunnel address changes every time this script restarts -> update the Bilt secret then.
#
# Usage:  ./start_innercast.sh               API + tunnel (Ctrl+C stops both)
#         ./start_innercast.sh --no-tunnel   API only on port 8787 (if you have your own HTTPS in front)
cd "$(dirname "$0")" || exit 1
PORT="${INNERCAST_PORT:-8787}"
mkdir -p logs

# the API restarts by itself if it stops, so new code can be loaded (pkill -f innercast_server.py)
# without restarting the tunnel, which would change the public address
( while true; do INNERCAST_PORT="$PORT" python3 -u innercast_server.py >> logs/innercast_server.log 2>&1; sleep 2; done ) &
SERVER=$!
for i in $(seq 1 20); do curl -fs "http://localhost:$PORT/health" >/dev/null && break; sleep 1; done
if ! curl -fs "http://localhost:$PORT/health" >/dev/null; then
  echo "The API did not start - see logs/innercast_server.log"; kill $SERVER 2>/dev/null; exit 1
fi
echo "InnerCast API running on http://localhost:$PORT"

TUNNEL=""
trap 'kill $SERVER $TUNNEL 2>/dev/null; pkill -f innercast_server.py; echo "InnerCast stopped"; exit 0' INT TERM

if [ "$1" != "--no-tunnel" ]; then
  : > logs/tunnel.log
  bin/cloudflared tunnel --no-autoupdate --url "http://localhost:$PORT" >> logs/tunnel.log 2>&1 &
  TUNNEL=$!
  URL=""
  for i in $(seq 1 60); do
    URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' logs/tunnel.log | head -1)
    [ -n "$URL" ] && break
    sleep 1
  done
  if [ -z "$URL" ]; then
    echo "The tunnel did not start - see logs/tunnel.log"; kill $SERVER $TUNNEL 2>/dev/null; exit 1
  fi
  echo "$URL" > INNERCAST_URL.txt
  echo "Public address: $URL   (saved in $(pwd)/INNERCAST_URL.txt)"
  echo "Health check in a browser: $URL/health"
fi
echo "Running. Press Ctrl+C to stop."
wait
