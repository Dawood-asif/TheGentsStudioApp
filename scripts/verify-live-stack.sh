#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${API_URL:-}" ]]; then
  echo "ERROR: API_URL is required. Example: API_URL=https://your-api.onrender.com ./scripts/verify-live-stack.sh"
  exit 1
fi

API_URL="${API_URL%/}"

echo "== Checking backend health =="
curl -fsS "$API_URL/health" | node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>{const j=JSON.parse(s); if(!j.success) process.exit(1); console.log(JSON.stringify(j,null,2));})"

echo "\n== Checking services endpoint =="
curl -fsS "$API_URL/api/services" | node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>{const j=JSON.parse(s); if(!j.success) process.exit(1); console.log('Services:', j.data.length); if(j.data.length < 54) process.exit(2);})"

echo "\n== Checking settings endpoint =="
curl -fsS "$API_URL/api/settings" | node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>{const j=JSON.parse(s); if(!j.success) process.exit(1); console.log('Settings rows:', j.data.length);})"

if [[ -n "${ADMIN_URL:-}" ]]; then
  echo "\n== Checking admin URL =="
  curl -I -fsS "${ADMIN_URL%/}" | head -10
fi

if [[ -n "${TEST_PHONE:-}" ]]; then
  echo "\n== Sending demo OTP to TEST_PHONE =="
  curl -fsS -X POST "$API_URL/api/otp/send" \
    -H 'Content-Type: application/json' \
    -d "{\"phone\":\"$TEST_PHONE\",\"purpose\":\"signup\"}" | node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>console.log(JSON.stringify(JSON.parse(s),null,2)))"
fi

echo "\nLive stack verification completed."
