#!/usr/bin/env bash
# Reload the InnerCast API with the current code, keeping the tunnel (and the public address) running.
# Runs ON THE SERVER (deploy_to_server.sh calls it). Its own command line is "bash reload_api.sh", so the
# pkill pattern below can never match this script itself.
cd "$(dirname "$0")" || exit 1
pkill -f "python3 -u innercast_server.py"
sleep 4
# the new start script restarts the API by itself; the old one (and a manual start) does not
if ! curl -fs localhost:8787/health >/dev/null; then
  setsid nohup python3 -u innercast_server.py >> logs/innercast_server.log 2>&1 < /dev/null &
  sleep 4
fi
echo "server health: $(curl -s localhost:8787/health)"
echo "service: $(systemctl is-active innercast)"
echo "address: $(cat INNERCAST_URL.txt)"
