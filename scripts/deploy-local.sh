#!/bin/bash
#
# KPTEST Local Deployment Script
# Deploys the application using Docker Compose
#
# Usage: ./scripts/deploy-local.sh [options]
# Options:
#   --rebuild    Force rebuild of all images
#   --logs       Follow logs after deployment
#   --clean      Remove all volumes before deploy
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Default options
REBUILD=false
FOLLOW_LOGS=false
CLEAN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --rebuild)
            REBUILD=true
            shift
            ;;
        --logs)
            FOLLOW_LOGS=true
            shift
            ;;
        --clean)
            CLEAN=true
            shift
            ;;
        -h|--help)
            echo "KPTEST Local Deployment Script"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --rebuild    Force rebuild of all images"
            echo "  --logs       Follow logs after deployment"
            echo "  --clean      Remove all volumes before deploy"
            echo "  -h, --help   Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  KPTEST Local Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

cd "$PROJECT_ROOT"

# Clean option - remove volumes
if [ "$CLEAN" = true ]; then
    echo -e "${YELLOW}[CLEAN] Removing all volumes...${NC}"
    docker compose down -v
fi

# Stop existing containers
echo -e "${YELLOW}[1/4] Stopping existing containers...${NC}"
docker compose down

# Build images
echo -e "${YELLOW}[2/4] Building Docker images...${NC}"
if [ "$REBUILD" = true ]; then
    echo -e "${YELLOW}Force rebuild enabled - building from scratch${NC}"
    docker compose build --no-cache
else
    docker compose build
fi

# Start services
echo -e "${YELLOW}[3/4] Starting services...${NC}"
docker compose up -d

# Wait for services to be healthy
echo -e "${YELLOW}[4/4] Waiting for services to be ready...${NC}"
sleep 10

# Check service status
echo ""
echo -e "${GREEN}Service Status:${NC}"
docker compose ps

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

# Service URLs
echo ""
echo -e "${GREEN}Available Services:${NC}"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8080"
echo "  HIS Mock:  http://localhost:8081"
echo "  Postgres:  localhost:5432"
echo "  Redis:     localhost:6379"
echo ""

# Health checks
echo -e "${YELLOW}Running health checks...${NC}"
sleep 5

HEALTH_OK=true

# Check backend health
if curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    HEALTH_OK=false
fi

# Check frontend
if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is responding${NC}"
else
    echo -e "${RED}✗ Frontend health check failed${NC}"
    HEALTH_OK=false
fi

# Check HIS Mock
if curl -sf http://localhost:8081/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ HIS Mock is healthy${NC}"
else
    echo -e "${RED}✗ HIS Mock health check failed${NC}"
    HEALTH_OK=false
fi

echo ""

if [ "$HEALTH_OK" = true ]; then
    echo -e "${GREEN}All health checks passed!${NC}"
else
    echo -e "${YELLOW}Some health checks failed. Check logs for details.${NC}"
fi

# Follow logs if requested
if [ "$FOLLOW_LOGS" = true ]; then
    echo ""
    echo -e "${YELLOW}Following logs (Ctrl+C to stop)...${NC}"
    docker compose logs -f
fi
