#!/bin/bash
# Seed all database tables for KPTEST
# Run this script to populate the database with test data

set -e  # Exit on error

# Database configuration
DB_USER="${DB_USER:-kptest}"
DB_NAME="${DB_NAME:-kptest}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  KPTEST Database Seeder${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Function to run a seed file
run_seed() {
    local file=$1
    local name=$(basename "$file" .sql)
    
    echo -e "${YELLOW}Seeding: $name...${NC}"
    
    if PGPASSWORD="${DB_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file" 2>&1; then
        echo -e "${GREEN}  ✓ $name completed${NC}"
    else
        echo -e "${RED}  ✗ $name failed${NC}"
        exit 1
    fi
}

# Check if database connection works
echo "Checking database connection..."
if ! PGPASSWORD="${DB_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to database${NC}"
    echo "Please ensure:"
    echo "  - PostgreSQL is running"
    echo "  - Database '$DB_NAME' exists"
    echo "  - User '$DB_USER' has proper permissions"
    echo ""
    echo "You can set environment variables:"
    echo "  export DB_USER=kptest"
    echo "  export DB_NAME=kptest"
    echo "  export DB_HOST=localhost"
    echo "  export DB_PORT=5432"
    echo "  export DB_PASSWORD=your_password"
    exit 1
fi
echo -e "${GREEN}  ✓ Database connection successful${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run seed files in order
echo "Running seed files..."
echo ""

run_seed "$SCRIPT_DIR/seed-users.sql"
run_seed "$SCRIPT_DIR/seed-patients.sql"
run_seed "$SCRIPT_DIR/seed-projects.sql"
run_seed "$SCRIPT_DIR/seed-messages.sql"
run_seed "$SCRIPT_DIR/seed-calendar.sql"
run_seed "$SCRIPT_DIR/seed-materials.sql"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Database seeded successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Test credentials:"
echo "  Email: admin@kptest.com"
echo "  Password: TestP@ssw0rd123"
echo ""
echo "Additional test users:"
echo "  - coordinator@kptest.com"
echo "  - doctor@kptest.com"
echo "  - patient1@kptest.com"
echo "  - patient2@kptest.com"
echo ""
