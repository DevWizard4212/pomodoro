#!/usr/bin/env bash
set -euo pipefail

PASS=0
FAIL=0
PORT=4173
DEV_PORT=5173

green() { printf "\033[32m%s\033[0m\n" "$1"; }
red()   { printf "\033[31m%s\033[0m\n" "$1"; }

assert() {
  local desc="$1"
  local result="$2"
  if [ "$result" = "true" ]; then
    green "  PASS: $desc"
    PASS=$((PASS + 1))
  else
    red "  FAIL: $desc"
    FAIL=$((FAIL + 1))
  fi
}

cleanup() {
  echo ""
  echo "Cleaning up..."
  [ -n "${DEV_PID:-}" ] && kill "$DEV_PID" 2>/dev/null || true
  [ -n "${PREVIEW_PID:-}" ] && kill "$PREVIEW_PID" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT

echo "========================================"
echo "  Pomodoro App - Test Suite (curl)"
echo "========================================"
echo ""

# ------------------------------------------
# 1. Build tests
# ------------------------------------------
echo "[1/4] Build tests"

echo "  Building project..."
if npm run build --prefix /Users/dominikkowalik/repositories/pomodoro > /tmp/pomodoro-build.log 2>&1; then
  assert "npm run build succeeds" "true"
else
  assert "npm run build succeeds" "false"
  echo "  Build log:"
  tail -20 /tmp/pomodoro-build.log
  echo "  Aborting - build failed."
  exit 1
fi

# Check dist output exists
assert "dist/index.html exists" \
  "$([ -f /Users/dominikkowalik/repositories/pomodoro/dist/index.html ] && echo true || echo false)"

assert "dist/assets/ contains JS bundle" \
  "$(ls /Users/dominikkowalik/repositories/pomodoro/dist/assets/*.js 2>/dev/null | grep -q . && echo true || echo false)"

assert "dist/assets/ contains CSS bundle" \
  "$(ls /Users/dominikkowalik/repositories/pomodoro/dist/assets/*.css 2>/dev/null | grep -q . && echo true || echo false)"

echo ""

# ------------------------------------------
# 2. Preview server tests (production build)
# ------------------------------------------
echo "[2/4] Preview server tests (production build)"

cd /Users/dominikkowalik/repositories/pomodoro
npx vite preview --port $PORT > /tmp/pomodoro-preview.log 2>&1 &
PREVIEW_PID=$!

# Wait for server to be ready
for i in $(seq 1 15); do
  if curl -s -o /dev/null -w '' "http://localhost:$PORT" 2>/dev/null; then
    break
  fi
  sleep 1
done

# Test: index.html is served
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/")
assert "GET / returns 200" "$([ "$HTTP_CODE" = "200" ] && echo true || echo false)"

# Test: HTML contains expected content
BODY=$(curl -s "http://localhost:$PORT/")

assert "HTML contains <title>Pomodoro Timer</title>" \
  "$(echo "$BODY" | grep -q '<title>Pomodoro Timer</title>' && echo true || echo false)"

assert "HTML contains <div id=\"root\">" \
  "$(echo "$BODY" | grep -q 'id="root"' && echo true || echo false)"

assert "HTML references JS bundle" \
  "$(echo "$BODY" | grep -q '\.js' && echo true || echo false)"

assert "HTML references CSS" \
  "$(echo "$BODY" | grep -q '\.css' && echo true || echo false)"

# Test: JS bundle is served with correct content-type
JS_FILE=$(ls /Users/dominikkowalik/repositories/pomodoro/dist/assets/*.js | head -1 | xargs basename)
JS_HEADERS=$(curl -sI "http://localhost:$PORT/assets/$JS_FILE")
JS_CODE=$(echo "$JS_HEADERS" | grep -i "HTTP/" | awk '{print $2}')
assert "GET /assets/$JS_FILE returns 200" "$([ "$JS_CODE" = "200" ] && echo true || echo false)"

JS_CT=$(echo "$JS_HEADERS" | grep -i "content-type")
assert "JS bundle has javascript content-type" \
  "$(echo "$JS_CT" | grep -qi 'javascript' && echo true || echo false)"

# Test: CSS bundle is served
CSS_FILE=$(ls /Users/dominikkowalik/repositories/pomodoro/dist/assets/*.css | head -1 | xargs basename)
CSS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/assets/$CSS_FILE")
assert "GET /assets/$CSS_FILE returns 200" "$([ "$CSS_CODE" = "200" ] && echo true || echo false)"

# Test: JS bundle contains expected React/app code
JS_BODY=$(curl -s "http://localhost:$PORT/assets/$JS_FILE")
assert "JS bundle contains 'Pomodoro' reference" \
  "$(echo "$JS_BODY" | grep -qi 'pomodoro' && echo true || echo false)"

assert "JS bundle contains React code" \
  "$(echo "$JS_BODY" | grep -q 'useState\|createElement\|jsx' && echo true || echo false)"

# Test: 404 for non-existent asset
CODE_404=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/assets/nonexistent.js")
assert "GET /assets/nonexistent.js returns 404" "$([ "$CODE_404" = "404" ] && echo true || echo false)"

# Test: SPA fallback - non-existent route still serves index.html
SPA_BODY=$(curl -s "http://localhost:$PORT/settings")
assert "SPA fallback: /settings serves index.html" \
  "$(echo "$SPA_BODY" | grep -q 'id="root"' && echo true || echo false)"

kill "$PREVIEW_PID" 2>/dev/null || true
wait "$PREVIEW_PID" 2>/dev/null || true
PREVIEW_PID=""

echo ""

# ------------------------------------------
# 3. Dev server tests
# ------------------------------------------
echo "[3/4] Dev server tests"

npx vite --port $DEV_PORT > /tmp/pomodoro-dev.log 2>&1 &
DEV_PID=$!

for i in $(seq 1 15); do
  if curl -s -o /dev/null -w '' "http://localhost:$DEV_PORT" 2>/dev/null; then
    break
  fi
  sleep 1
done

DEV_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$DEV_PORT/")
assert "Dev server GET / returns 200" "$([ "$DEV_CODE" = "200" ] && echo true || echo false)"

DEV_BODY=$(curl -s "http://localhost:$DEV_PORT/")
assert "Dev server serves index.html with Pomodoro Timer title" \
  "$(echo "$DEV_BODY" | grep -q '<title>Pomodoro Timer</title>' && echo true || echo false)"

# Test: Vite injects HMR client in dev mode
assert "Dev server injects Vite HMR client" \
  "$(echo "$DEV_BODY" | grep -q '@vite\|vite/client\|modulepreload' && echo true || echo false)"

# Test: Source files are accessible in dev mode
MAIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$DEV_PORT/src/main.tsx")
assert "Dev server serves /src/main.tsx (200)" "$([ "$MAIN_CODE" = "200" ] && echo true || echo false)"

kill "$DEV_PID" 2>/dev/null || true
wait "$DEV_PID" 2>/dev/null || true
DEV_PID=""

echo ""

# ------------------------------------------
# 4. Static file checks
# ------------------------------------------
echo "[4/4] Static file & content checks"

assert "index.html exists in project root" \
  "$([ -f /Users/dominikkowalik/repositories/pomodoro/index.html ] && echo true || echo false)"

assert "src/main.tsx entry point exists" \
  "$([ -f /Users/dominikkowalik/repositories/pomodoro/src/main.tsx ] && echo true || echo false)"

assert "src/App.tsx exists" \
  "$([ -f /Users/dominikkowalik/repositories/pomodoro/src/App.tsx ] && echo true || echo false)"

assert "TypeScript config exists" \
  "$([ -f /Users/dominikkowalik/repositories/pomodoro/tsconfig.json ] && echo true || echo false)"

assert "Vite config exists" \
  "$([ -f /Users/dominikkowalik/repositories/pomodoro/vite.config.ts ] && echo true || echo false)"

# Check key components exist
for comp in Timer Controls Settings Stats SessionInfo Layout; do
  assert "Component src/components/$comp.tsx exists" \
    "$([ -f /Users/dominikkowalik/repositories/pomodoro/src/components/$comp.tsx ] && echo true || echo false)"
done

# Check store exists
assert "Zustand store exists" \
  "$([ -f /Users/dominikkowalik/repositories/pomodoro/src/store/pomodoroStore.ts ] && echo true || echo false)"

# Check production build size is reasonable (< 5MB)
DIST_SIZE=$(du -sk /Users/dominikkowalik/repositories/pomodoro/dist 2>/dev/null | awk '{print $1}')
assert "Production build is under 5MB (${DIST_SIZE}KB)" \
  "$([ "${DIST_SIZE:-0}" -lt 5120 ] && echo true || echo false)"

echo ""
echo "========================================"
echo "  Results: $PASS passed, $FAIL failed"
echo "========================================"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
