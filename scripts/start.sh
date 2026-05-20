#!/bin/bash
set -e

# =============================================================================
# Adaptive Meal Planning Platform — Start Script
# =============================================================================
# 1. Generates Prisma client
# 2. Builds the API
# 3. Seeds the database if no data exists (idempotent — safe to re-run)
# 4. Starts API server (http://localhost:4000)
# 5. Starts Web dashboard (http://localhost:3000)
#
# Usage:  bash scripts/start.sh
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║    🚀  Adaptive Meal Planning Platform                       ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# ── 1. Generate Prisma client ──────────────────────────────────────────────
echo "📦 Generating Prisma client..."
pnpm --filter database prisma:generate 2>&1 | tail -1

# ── 2. Build API ───────────────────────────────────────────────────────────
echo ""
echo "🔨 Building API..."
pnpm --filter api exec tsc --build tsconfig.json --force 2>&1 | tail -1

# ── 3. Seed database (idempotent) ──────────────────────────────────────────
echo ""
echo "🌱 Database check & seed (safe to re-run — skips if data exists)..."
DATABASE_URL="postgresql://mealplan:mealplan_dev@localhost:5433/adaptive_meals?schema=public" \
  pnpm --filter database prisma:seed 2>&1

# ── 4. Start API server ────────────────────────────────────────────────────
echo ""
echo "🌐 Starting API server on http://localhost:4000 ..."
cd apps/api
DATABASE_URL="postgresql://mealplan:mealplan_dev@localhost:5433/adaptive_meals?schema=public" node dist/main.js > /tmp/meal-api.log 2>&1 &
API_PID=$!
cd "$PROJECT_DIR"

echo "   Waiting for API..."
for i in $(seq 1 30); do
  if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
    echo "   ✅ API ready"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "   ⚠️  API didn't respond — check /tmp/meal-api.log"
  fi
  sleep 1
done

# ── 5. Start Web dashboard ─────────────────────────────────────────────────
echo "🖥️  Starting Web dashboard on http://localhost:3000 ..."
pnpm --filter web dev > /tmp/meal-web.log 2>&1 &
WEB_PID=$!

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║    ✅  Platform is running!                                  ║"
echo "║                                                               ║"
echo "║    API:        http://localhost:4000                          ║"
echo "║    Swagger:    http://localhost:4000/api/docs                 ║"
echo "║    Dashboard:  http://localhost:3000                          ║"
echo "║                                                               ║"
echo "║    Press Ctrl+C to stop all services                          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# ── Handle shutdown ────────────────────────────────────────────────────────
cleanup() {
  echo ""
  echo "🛑 Stopping services..."
  kill "$API_PID" 2>/dev/null
  kill "$WEB_PID" 2>/dev/null
  wait
  echo "👋 Goodbye!"
}
trap cleanup SIGINT SIGTERM

wait
