#!/usr/bin/env bash
# Test the running InnerCast API. Output is also saved in logs/test_api_result.txt.
# Usage:  ./test_api.sh            (uses the address in INNERCAST_URL.txt, else http://localhost:8787)
#         ./test_api.sh https://example.trycloudflare.com
cd "$(dirname "$0")" || exit 1
mkdir -p logs
URL="${1:-$(cat INNERCAST_URL.txt 2>/dev/null)}"
URL="${URL:-http://localhost:8787}"
KEY=$(grep '^INNERCAST_API_KEY=' qwen_credentials.env | cut -d= -f2-)
{
echo "Testing $URL"
echo "== 1. health (expect ok: true)"
curl -sS --max-time 20 "$URL/health"; echo
echo "== 2. wrong key (expect 401)"
curl -s --max-time 20 -o /dev/null -w '%{http_code}\n' -X POST "$URL/answer" \
  -H 'Content-Type: application/json' -H 'X-API-Key: wrong-key' -d '{"message":"hi"}'
echo "== 3. real answer (takes 5-30 s)"
curl -sS --max-time 120 -X POST "$URL/answer" -H 'Content-Type: application/json' -H "X-API-Key: $KEY" \
  -d '{"message":"I just got promoted to lead my old friends and I feel like a fraud."}' |
  python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("error") or d["answer"]); print("\n-- seconds:", d.get("seconds"))'
} 2>&1 | tee logs/test_api_result.txt
