#!/bin/bash
set -e

echo "🛑 Stopping Adaptive Meal Platform..."

# Stop API
if [ -f /tmp/meal-api.pid ]; then
    kill $(cat /tmp/meal-api.pid) 2>/dev/null || true
    rm -f /tmp/meal-api.pid
    echo "✅ API stopped"
fi

# Stop Web
if [ -f /tmp/meal-web.pid ]; then
    kill $(cat /tmp/meal-web.pid) 2>/dev/null || true
    rm -f /tmp/meal-web.pid
    echo "✅ Web stopped"
fi

# Stop Docker infrastructure
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
docker compose -f "$PROJECT_ROOT/infra/docker/docker-compose.yml" down 2>/dev/null || true
echo "✅ Infrastructure stopped"

echo "✅ All services stopped"
