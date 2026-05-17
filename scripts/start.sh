#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🍽️  Starting Adaptive Meal Platform..."

# Start infrastructure
echo "📦 Starting PostgreSQL and Redis..."
docker compose -f "$PROJECT_ROOT/infra/docker/docker-compose.yml" up -d

# Wait for PostgreSQL
echo "⏳ Waiting for PostgreSQL..."
sleep 5

# Run migrations
echo "🗄️  Running database migrations..."
cd "$PROJECT_ROOT/packages/database"
DATABASE_URL="postgresql://mealplan:mealplan_dev@localhost:5433/adaptive_meals?schema=public" npx prisma migrate deploy 2>/dev/null || true
cd "$PROJECT_ROOT"

# Build packages
echo "🔨 Building packages..."
for pkg in types shared config database recommendation-engine; do
    cd "$PROJECT_ROOT/packages/$pkg" && npx tsc 2>/dev/null || true
done
cd "$PROJECT_ROOT"

# Build API
echo "🔨 Building API..."
cd "$PROJECT_ROOT/apps/api"
rm -rf dist tsconfig.tsbuildinfo
npx tsc 2>/dev/null || true

# Start API
echo "🚀 Starting API on port 4000..."
cd "$PROJECT_ROOT/apps/api"
nohup node dist/main.js > /tmp/meal-api.log 2>&1 &
echo $! > /tmp/meal-api.pid

# Start Web
echo "🌐 Starting Web on port 3000..."
cd "$PROJECT_ROOT/apps/web"
nohup npx next start --port 3000 > /tmp/meal-web.log 2>&1 &
echo $! > /tmp/meal-web.pid

sleep 3

echo ""
echo "✅ All services running!"
echo "📊 Dashboard:   http://localhost:3000"
echo "📚 Swagger:     http://localhost:4000/api/docs"
echo "💚 Health:      http://localhost:4000/api/health"
echo "🛑 Stop:        ./scripts/stop.sh"
