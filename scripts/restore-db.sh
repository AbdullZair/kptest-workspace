#!/bin/bash
#===============================================================================
# KPTEST PostgreSQL Restore Script
# Point-in-time recovery from backup files
#===============================================================================

set -euo pipefail

#-------------------------------------------------------------------------------
# Configuration
#-------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/kptest/postgresql}"
S3_BUCKET="${S3_BACKUP_BUCKET:-kptest-backups-production}"
S3_PREFIX="${S3_PREFIX:-postgresql}"
ENCRYPTION_KEY="${ENCRYPTION_KEY:-}"  # Must match encryption key used for backup

# Database connection
DB_HOST="${DB_HOST:-kptest-postgres.kptest-production.svc.cluster.local}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-kptest}"
DB_USER="${DB_USER:-kptest}"
DB_PASSWORD="${DB_PASSWORD:-}"

# Restore target
RESTORE_FILE="${RESTORE_FILE:-}"  # Specific file to restore
RESTORE_TIMESTAMP="${RESTORE_TIMESTAMP:-}"  # Timestamp to restore to (YYYYMMDD_HHMMSS)
S3_RESTORE="${S3_RESTORE:-false}"  # Restore from S3

# Logging
LOG_FILE="${LOG_FILE:-/var/log/kptest/restore-$(date +%Y%m%d_%H%M%S).log}"

#-------------------------------------------------------------------------------
# Functions
#-------------------------------------------------------------------------------

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

log_info() { log "INFO" "$@"; }
log_warn() { log "WARN" "$@"; }
log_error() { log "ERROR" "$@"; }

usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

Restore PostgreSQL database from backup.

Options:
    -f, --file FILE          Specific backup file to restore
    -t, --timestamp TS       Restore to specific timestamp (YYYYMMDD_HHMMSS)
    -s, --from-s3            Download backup from S3
    -b, --bucket BUCKET      S3 bucket name (default: $S3_BUCKET)
    -e, --encrypt-key KEY    Encryption key for encrypted backups
    -n, --dry-run            Show what would be restored without executing
    -h, --help               Show this help message

Examples:
    # Restore latest local backup
    $(basename "$0")

    # Restore specific file
    $(basename "$0") -f kptest_backup_20260424_120000.sql.gz

    # Restore from S3
    $(basename "$0") -s -t 20260424_120000

    # Restore encrypted backup
    $(basename "$0") -f kptest_backup_20260424_120000.sql.gz.enc -e "mykey"

EOF
    exit 1
}

check_dependencies() {
    local deps=("psql" "gunzip" "aws" "openssl")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log_error "Required dependency not found: $dep"
            exit 1
        fi
    done
    log_info "All dependencies check passed"
}

list_available_backups() {
    log_info "Available backups:"
    
    if [[ "$S3_RESTORE" == "true" ]]; then
        log_info "S3 Backups in s3://${S3_BUCKET}/${S3_PREFIX}/:"
        aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" --recursive | \
            grep -E '\.sql\.gz(\.enc)?$' | \
            awk '{print $4}'
    else
        log_info "Local backups in ${BACKUP_DIR}:"
        ls -la "${BACKUP_DIR}"/kptest_backup_*.sql.gz* 2>/dev/null || echo "No local backups found"
    fi
}

find_backup_file() {
    if [[ -n "$RESTORE_FILE" ]]; then
        # Specific file requested
        if [[ "$S3_RESTORE" == "true" ]]; then
            BACKUP_PATH="s3://${S3_BUCKET}/${S3_PREFIX}/${RESTORE_FILE}"
        else
            BACKUP_PATH="${BACKUP_DIR}/${RESTORE_FILE}"
        fi
    elif [[ -n "$RESTORE_TIMESTAMP" ]]; then
        # Find backup by timestamp
        if [[ "$S3_RESTORE" == "true" ]]; then
            BACKUP_PATH=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" --recursive | \
                grep "${RESTORE_TIMESTAMP}" | grep -E '\.sql\.gz(\.enc)?$' | \
                awk '{print "s3://'"${S3_BUCKET}"'/"$4}' | head -1)
        else
            BACKUP_PATH=$(ls "${BACKUP_DIR}"/kptest_backup_${RESTORE_TIMESTAMP}*.sql.gz* 2>/dev/null | head -1)
        fi
    else
        # Find latest backup
        if [[ "$S3_RESTORE" == "true" ]]; then
            BACKUP_PATH=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" --recursive | \
                grep -E '\.sql\.gz(\.enc)?$' | \
                sort -k1,2 | tail -1 | awk '{print "s3://'"${S3_BUCKET}"'/"$4}')
        else
            BACKUP_PATH=$(ls -t "${BACKUP_DIR}"/kptest_backup_*.sql.gz* 2>/dev/null | head -1)
        fi
    fi
    
    if [[ -z "$BACKUP_PATH" ]]; then
        log_error "No backup file found matching criteria"
        list_available_backups
        exit 1
    fi
    
    log_info "Selected backup: $BACKUP_PATH"
}

download_backup() {
    if [[ "$S3_RESTORE" == "true" ]]; then
        log_info "Downloading backup from S3"
        local filename=$(basename "$BACKUP_PATH")
        aws s3 cp "$BACKUP_PATH" "${BACKUP_DIR}/${filename}"
        BACKUP_PATH="${BACKUP_DIR}/${filename}"
        log_info "Download completed: $BACKUP_PATH"
    fi
}

decrypt_backup() {
    if [[ "$BACKUP_PATH" =~ \.enc$ ]]; then
        if [[ -z "$ENCRYPTION_KEY" ]]; then
            log_error "Backup is encrypted but no encryption key provided"
            exit 1
        fi
        
        log_info "Decrypting backup"
        local decrypted_file="${BACKUP_PATH%.enc}"
        
        openssl enc -aes-256-cbc \
            -d \
            -pbkdf2 \
            -in "$BACKUP_PATH" \
            -out "$decrypted_file" \
            -pass pass:"$ENCRYPTION_KEY"
        
        BACKUP_PATH="$decrypted_file"
        log_info "Decryption completed"
    fi
}

prepare_restore() {
    log_warn "========================================="
    log_warn "PREPARE FOR DATABASE RESTORE"
    log_warn "========================================="
    log_warn "Database: $DB_NAME on $DB_HOST:$DB_PORT"
    log_warn "Backup file: $BACKUP_PATH"
    log_warn ""
    log_warn "WARNING: This will DROP all existing data in the database!"
    log_warn ""
    
    if [[ "${DRY_RUN:-false}" != "true" ]]; then
        read -p "Type 'RESTORE' to confirm: " confirm
        if [[ "$confirm" != "RESTORE" ]]; then
            log_info "Restore cancelled by user"
            exit 0
        fi
    else
        log_info "Dry run - no changes will be made"
    fi
}

drop_database() {
    log_info "Dropping existing database: $DB_NAME"
    
    export PGPASSWORD="$DB_PASSWORD"
    
    # First, terminate all connections to the database
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c \
        "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME';" || true
    
    # Drop and recreate database
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c \
        "DROP DATABASE IF EXISTS $DB_NAME;"
    
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c \
        "CREATE DATABASE $DB_NAME;"
    
    unset PGPASSWORD
    
    log_info "Database recreated successfully"
}

restore_database() {
    log_info "Starting database restore"
    
    export PGPASSWORD="$DB_PASSWORD"
    
    if [[ "$BACKUP_PATH" =~ \.gz$ ]]; then
        # Compressed backup
        gunzip -c "$BACKUP_PATH" | \
            psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
            2>> "$LOG_FILE"
    else
        # Uncompressed backup
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
            < "$BACKUP_PATH" \
            2>> "$LOG_FILE"
    fi
    
    unset PGPASSWORD
    
    if [[ $? -eq 0 ]]; then
        log_info "Database restore completed successfully"
    else
        log_error "Database restore failed"
        exit 1
    fi
}

verify_restore() {
    log_info "Verifying restore"
    
    export PGPASSWORD="$DB_PASSWORD"
    
    # Check table count
    local table_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
    
    log_info "Tables found: $table_count"
    
    # Check row counts for key tables
    for table in users patients projects; do
        local count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
            "SELECT COUNT(*) FROM $table;" 2>/dev/null || echo "N/A")
        log_info "Table '$table' rows: $count"
    done
    
    unset PGPASSWORD
    
    log_info "Restore verification completed"
}

send_notification() {
    local status="$1"
    local message="$2"
    
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"*PostgreSQL Restore ${status}*\\n${message}\"}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
}

#-------------------------------------------------------------------------------
# Main Execution
#-------------------------------------------------------------------------------

main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--file)
                RESTORE_FILE="$2"
                shift 2
                ;;
            -t|--timestamp)
                RESTORE_TIMESTAMP="$2"
                shift 2
                ;;
            -s|--from-s3)
                S3_RESTORE="true"
                shift
                ;;
            -b|--bucket)
                S3_BUCKET="$2"
                shift 2
                ;;
            -e|--encrypt-key)
                ENCRYPTION_KEY="$2"
                shift 2
                ;;
            -n|--dry-run)
                DRY_RUN="true"
                shift
                ;;
            -h|--help)
                usage
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                ;;
        esac
    done
    
    log_info "========================================="
    log_info "Starting PostgreSQL Restore Process"
    log_info "========================================="
    
    # Pre-flight checks
    check_dependencies
    
    # Find and prepare backup
    find_backup_file
    download_backup
    decrypt_backup
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log_info "Dry run completed. Would restore from: $BACKUP_PATH"
        exit 0
    fi
    
    # Perform restore
    prepare_restore
    drop_database
    restore_database
    verify_restore
    
    # Send success notification
    send_notification "SUCCESS" "PostgreSQL restore completed successfully from: $(basename "$BACKUP_PATH")"
    
    log_info "========================================="
    log_info "Restore Process Completed Successfully"
    log_info "========================================="
}

# Error handling
trap 'log_error "Restore failed with error"; send_notification "FAILED" "PostgreSQL restore failed. Check logs for details."' ERR

# Run main function
main "$@"
