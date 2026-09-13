#!/usr/bin/env bash
# OPTIONAL: keep InnerCast (API + tunnel) running in the background and after reboots, using systemd.
# Needs sudo. Run from inside this folder after setup_linux.sh:  ./install_service.sh
# Afterwards:  sudo systemctl status innercast  |  sudo systemctl restart innercast  |  logs in ./logs/
# The public address is rewritten to INNERCAST_URL.txt on every (re)start - it CHANGES each time.
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
sudo tee /etc/systemd/system/innercast.service >/dev/null <<UNIT
[Unit]
Description=InnerCast API + Cloudflare quick tunnel
After=network-online.target
Wants=network-online.target

[Service]
User=$(whoami)
WorkingDirectory=$DIR
ExecStart=$DIR/start_innercast.sh
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT
sudo systemctl daemon-reload
sudo systemctl enable --now innercast
echo "Waiting for the public address..."
for i in $(seq 1 60); do [ -s "$DIR/INNERCAST_URL.txt" ] && break; sleep 1; done
echo "InnerCast service running. Public address: $(cat "$DIR/INNERCAST_URL.txt" 2>/dev/null)"
