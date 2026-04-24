#!/bin/bash
#
# KPTEST Database Backup Script
# Creates a backup of the PostgreSQL database
#
# Usage: ./scripts/backup-db.sh [options]
# Options:
#   --restore FILE   Restore from backup file
#   --list           List available backups
#   --clean          Remove backups older than 7 days
#   --output DIR     Output directory for backups
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/devops/backup"
CONTAINER_NAME="kptest-postgres"
DB_NAME="kptest"
DB_USER="kptest"
RETENTION_DAYS=7

# Parse arguments
RESTORE_FILE=""
LIST_ONLY=false
CLEAN_OLD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --restore)
            RESTORE_FILE="$2"
            shift 2
            ;;
        --list)
            LIST_ONLY=true
            shift
            ;;
        --clean)
            CLEAN_OLD=true
            shift
            ;;
        --output)
            BACKUP_DIR="$2"
            shift 2
            ;;
        -h|--help)
            echo "KPTEST Database Backup Script"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --restore FILE   Restore from backup file"
            echo "  --list           List available backups"
            echo "  --clean          Remove backups older than 7 days"
            echo "  --output DIR     Output directory for backups"
            echo "  -h, --help       Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# List backups
if [ "$LIST_ONLY" = true ]; then
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Available Backups${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        ls -lh "$BACKUP_DIR"/*.sql 2>/dev/null | awk '{print $9, $5}' | while read -r file size; do
            echo -e "  ${YELLOW}$(basename "$file")${NC}  (${size})"
        done
    else
        echo -e "${YELLOW}No backups found${NC}"
    fi
    echo ""
    exit 0
fi

# Clean old backups
if [ "$CLEAN_OLD" = true ]; then
    echo -e "${YELLOW}Cleaning backups older than ${RETENTION_DAYS} days...${NC}"
    find "$BACKUP_DIR" -name "*.sql" -type f -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true
    find "$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true
    echo -e "${GREEN}Cleanup complete${NC}"
    exit 0
fi

# Restore from backup
if [ -n "$RESTORE_FILE" ]; then
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Restoring Database${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    if [ ! -f "$RESTORE_FILE" ]; then
        echo -e "${RED}Backup file not found: $RESTORE_FILE${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Restoring from: ${RESTORE_FILE}${NC}"
    echo -e "${YELLOW}Target database: ${DB_NAME}${NC}"
    echo ""
    
    # Check if container is running
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${RED}PostgreSQL container is not running${NC}"
        exit 1
    fi
    
    # Restore
    echo -e "${YELLOW}Starting restore...${NC}"
    docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$RESTORE_FILE"
    
    echo ""
    echo -e "${GREEN}Restore complete!${NC}"
    exit 0
fi

# Create backup
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Database Backup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if container is running
echo -ne "${YELLOW}Checking PostgreSQL container...${NC} "
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}NOT RUNNING${NC}"
    echo -e "${RED}Please start the container first: docker compose up -d${NC}"
    exit 1
fi
echo -e "${GREEN}RUNNING${NC}"

# Generate backup filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${DB_NAME}_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

echo -e "${YELLOW}Database: ${DB_NAME}${NC}"
echo -e "${YELLOW}Container: ${CONTAINER_NAME}${NC}"
echo -e "${YELLOW}Output: ${BACKUP_FILE}${NC}"
echo ""

# Create backup
echo -e "${YELLOW}Creating backup...${NC}"
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

# Compress backup
echo -e "${YELLOW}Compressing backup...${NC}"
gzip "$BACKUP_FILE"

# Verify backup
if [ -f "$BACKUP_FILE_GZ" ]; then
    BACKUP_SIZE=$(ls -lh "$BACKUP_FILE_GZ" | awk '{print $5}')
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  Backup Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "  File: ${BLUE}$(basename "$BACKUP_FILE_GZ")${NC}"
    echo -e "  Size: ${GREEN}${BACKUP_SIZE}${NC}"
    echo -e "  Location: ${BLUE}${BACKUP_FILE_GZ}${NC}"
    echo ""
    
    # Show backup info
    echo -e "${YELLOW}Backup Info:${NC}"
    gunzip -c "$BACKUP_FILE_GZ" | head -20 | grep -E "^--|CREATE|SET" | head -10
    
    echo ""
    echo -e "${GREEN}Backup completed successfully!${NC}"
else
    echo -e "${RED}Backup failed!${NC}"
    exit 1
fi
