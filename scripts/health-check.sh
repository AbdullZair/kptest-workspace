#!/bin/bash
#
# KPTEST Health Check Script
# Checks the health status of all services
#
# Usage: ./scripts/health-check.sh [options]
# Options:
#   --verbose    Show detailed response info
#   --timeout N  Set timeout in seconds (default: 5)
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TIMEOUT=5
VERBOSE=false
FAILED=0
PASSED=0

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -h|--help)
            echo "KPTEST Health Check Script"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -v, --verbose    Show detailed response info"
            echo "  --timeout N      Set timeout in seconds (default: 5)"
            echo "  -h, --help       Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  KPTEST Health Check${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Timeout: ${TIMEOUT}s${NC}"
echo ""

# Function to check endpoint
check_endpoint() {
    local name="$1"
    local url="$2"
    local description="$3"
    
    echo -ne "${YELLOW}Checking ${name}...${NC} "
    
    START_TIME=$(date +%s%N)
    
    if curl -sf --max-time "$TIMEOUT" "$url" > /dev/null 2>&1; then
        END_TIME=$(date +%s%N)
        DURATION=$(( (END_TIME - START_TIME) / 1000000 ))
        
        echo -e "${GREEN}✓ PASS${NC} (${DURATION}ms)"
        
        if [ "$VERBOSE" = true ]; then
            RESPONSE=$(curl -sf --max-time "$TIMEOUT" "$url" 2>&1)
            echo -e "  ${BLUE}URL:${NC} $url"
            echo -e "  ${BLUE}Response:${NC} ${RESPONSE:0:100}"
            echo ""
        fi
        
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        
        if [ "$VERBOSE" = true ]; then
            echo -e "  ${BLUE}URL:${NC} $url"
            HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url" 2>&1)
            echo -e "  ${BLUE}HTTP Code:${NC} $HTTP_CODE"
            echo ""
        fi
        
        ((FAILED++))
        return 1
    fi
}

# Function to check Docker container health
check_container() {
    local name="$1"
    
    echo -ne "${YELLOW}Checking container ${name}...${NC} "
    
    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${name}$"; then
        STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$name" 2>/dev/null || echo "unknown")
        
        if [ "$STATUS" = "healthy" ] || [ "$STATUS" = "unknown" ]; then
            echo -e "${GREEN}✓ RUNNING${NC}"
            ((PASSED++))
            return 0
        else
            echo -e "${RED}✗ $STATUS${NC}"
            ((FAILED++))
            return 1
        fi
    else
        echo -e "${RED}✗ NOT FOUND${NC}"
        ((FAILED++))
        return 1
    fi
}

# HTTP Endpoint Checks
echo -e "${BLUE}--- HTTP Endpoint Checks ---${NC}"
echo ""

check_endpoint "Backend API" "http://localhost:8080/api/v1/health" "Backend health endpoint"
check_endpoint "Backend Actuator" "http://localhost:8080/actuator/health" "Spring Boot actuator"
check_endpoint "Frontend" "http://localhost:3000" "Frontend web app"
check_endpoint "HIS Mock API" "http://localhost:8081/api/v1/health" "HIS Mock health endpoint"

echo ""

# Docker Container Checks (if Docker is available)
if command -v docker &> /dev/null; then
    echo -e "${BLUE}--- Docker Container Checks ---${NC}"
    echo ""
    
    check_container "kptest-postgres"
    check_container "kptest-redis"
    check_container "kptest-backend"
    check_container "kptest-frontend"
    check_container "kptest-his-mock"
    
    echo ""
fi

# Database Connection Check
echo -e "${BLUE}--- Database Check ---${NC}"
echo ""
echo -ne "${YELLOW}Checking PostgreSQL connection...${NC} "

if docker exec kptest-postgres pg_isready -U kptest -d kptest > /dev/null 2>&1; then
    echo -e "${GREEN}✓ CONNECTED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

echo ""

# Redis Connection Check
echo -e "${BLUE}--- Redis Check ---${NC}"
echo ""
echo -ne "${YELLOW}Checking Redis connection...${NC} "

if docker exec kptest-redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ CONNECTED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Health Check Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "  ${GREEN}Passed:${NC} $PASSED"
echo -e "  ${RED}Failed:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All health checks passed!${NC}"
    exit 0
else
    echo -e "${RED}Some health checks failed!${NC}"
    exit 1
fi
