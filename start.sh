#!/bin/bash

# KPTEST - Quick Start Script
# Uruchamia wszystkie usługi i wyświetla status

set -e

echo "🚀 Starting KPTEST development environment..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop or Docker Engine."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start all services
echo "📦 Starting services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
echo ""

# Wait for PostgreSQL
echo -n "🐘 Waiting for PostgreSQL"
until docker compose exec postgres pg_isready -U kptest -d kptest > /dev/null 2>&1; do
    echo -n "."
    sleep 1
done
echo " Ready!"

# Wait for Redis
echo -n "🔴 Waiting for Redis"
until docker compose exec redis redis-cli ping > /dev/null 2>&1; do
    echo -n "."
    sleep 1
done
echo " Ready!"

# Wait for backend
echo -n "☕ Waiting for Backend API"
until curl -s http://localhost:8080/api/v1/health > /dev/null 2>&1; do
    echo -n "."
    sleep 2
done
echo " Ready!"

echo ""
echo "✅ All services are ready!"
echo ""

# Display status
echo "📊 Service Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose ps
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Display access info
echo "🌐 Application URLs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8080/api/v1"
echo "  HIS Mock:  http://localhost:8081"
echo "  PostgreSQL: localhost:5432"
echo "  Redis:     localhost:6379"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Display test credentials
echo "🧪 Test Credentials:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  HIS Mock Patients:"
echo "    PESEL: 12345678901, Cart: CART001 (Jan Kowalski)"
echo "    PESEL: 98765432109, Cart: CART002 (Anna Nowak)"
echo "    PESEL: 11111111111, Cart: CART003 (Piotr Wiśniewski)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📝 Useful commands:"
echo "  docker compose logs -f     # View all logs"
echo "  docker compose logs -f backend  # View backend logs"
echo "  docker compose down        # Stop all services"
echo "  docker compose restart backend  # Restart backend"
echo ""

echo "✅ Development environment is ready!"
