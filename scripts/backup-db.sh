#!/bin/bash
#===============================================================================
# KPTEST PostgreSQL Backup Script
# Automated backup with compression, encryption, and S3 upload capability
#===============================================================================

set -euo pipefail

#-------------------------------------------------------------------------------
# Configuration
#-------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/kptest/postgresql}"
S3_BUCKET="${S3_BACKUP_BUCKET:-kptest-backups-production}"
S3_PREFIX="${S3_PREFIX:-postgresql}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
ENCRYPTION_KEY="${ENCRYPTION_KEY:-}"  # Optional: Set for encryption

# Database connection
DB_HOST="${DB_HOST:-kptest-postgres.kptest-production.svc.cluster.local}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-kptest}"
DB_USER="${DB_USER:-kptest}"
DB_PASSWORD="${DB_PASSWORD:-}"

# Logging
LOG_FILE="${LOG_FILE:-/var/log/kptest/backup-$(date +%Y%m%d).log}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="kptest_backup_${TIMESTAMP}.sql.gz"
ENCRYPTED_FILE="kptest_backup_${TIMESTAMP}.sql.gz.enc"

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

check_dependencies() {
    local deps=("pg_dump" "gzip" "aws" "openssl")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log_error "Required dependency not found: $dep"
            exit 1
        fi
    done
    log_info "All dependencies check passed"
}

setup_backup_dir() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log_info "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
        chmod 750 "$BACKUP_DIR"
    fi
    
    if [[ ! -d "$(dirname "$LOG_FILE")" ]]; then
        mkdir -p "$(dirname "$LOG_FILE")"
    fi
}

create_backup() {
    log_info "Starting PostgreSQL backup"
    log_info "Database: $DB_NAME on $DB_HOST:$DB_PORT"
    
    export PGPASSWORD="$DB_PASSWORD"
    
    # Create backup with pg_dump
    pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --format=plain \
        --no-owner \
        --no-acl \
        --verbose \
        2>> "$LOG_FILE" | gzip > "${BACKUP_DIR}/${BACKUP_FILE}"
    
    unset PGPASSWORD
    
    if [[ $? -eq 0 ]]; then
        local size=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
        log_info "Backup created successfully: ${BACKUP_FILE} (${size})"
    else
        log_error "Backup failed"
        exit 1
    fi
}

encrypt_backup() {
    if [[ -n "$ENCRYPTION_KEY" ]]; then
        log_info "Encrypting backup file"
        
        openssl enc -aes-256-cbc \
            -salt \
            -pbkdf2 \
            -in "${BACKUP_DIR}/${BACKUP_FILE}" \
            -out "${BACKUP_DIR}/${ENCRYPTED_FILE}" \
            -pass pass:"$ENCRYPTION_KEY"
        
        if [[ $? -eq 0 ]]; then
            rm "${BACKUP_DIR}/${BACKUP_FILE}"
            log_info "Backup encrypted: ${ENCRYPTED_FILE}"
        else
            log_error "Encryption failed"
            exit 1
        fi
    else
        log_warn "Encryption key not set, skipping encryption"
    fi
}

upload_to_s3() {
    log_info "Uploading backup to S3"
    
    local file_to_upload="${BACKUP_DIR}/${ENCRYPTED_FILE:-$BACKUP_FILE}"
    
    aws s3 cp \
        "$file_to_upload" \
        "s3://${S3_BUCKET}/${S3_PREFIX}/${TIMESTAMP}/" \
        --storage-class STANDARD_IA \
        --server-side-encryption AES256 \
        --metadata "backup-type=postgresql,db-name=${DB_NAME}"
    
    if [[ $? -eq 0 ]]; then
        log_info "Backup uploaded to s3://${S3_BUCKET}/${S3_PREFIX}/${TIMESTAMP}/"
    else
        log_error "S3 upload failed"
        exit 1
    fi
}

cleanup_old_backups() {
    log_info "Cleaning up backups older than ${RETENTION_DAYS} days"
    
    # Local cleanup
    find "$BACKUP_DIR" -name "kptest_backup_*.sql.gz*" -type f -mtime +${RETENTION_DAYS} -delete
    
    # S3 cleanup
    aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | \
        while read -r line; do
            local date=$(echo "$line" | awk '{print $1, $2}')
            local days_old=$(( ($(date +%s) - $(date -d "$date" +%s)) / 86400 ))
            if [[ $days_old -gt $RETENTION_DAYS ]]; then
                local folder=$(echo "$line" | awk '{print $4}')
                aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${folder}" --recursive
                log_info "Deleted old S3 backup: ${folder}"
            fi
        done
    
    log_info "Cleanup completed"
}

verify_backup() {
    log_info "Verifying backup integrity"
    
    local file_to_verify="${BACKUP_DIR}/${ENCRYPTED_FILE:-$BACKUP_FILE}"
    
    if [[ -f "$file_to_verify" ]]; then
        # Check file is not empty
        if [[ -s "$file_to_verify" ]]; then
            log_info "Backup file exists and is not empty"
        else
            log_error "Backup file is empty"
            exit 1
        fi
        
        # Test gzip integrity (if not encrypted)
        if [[ ! "$file_to_verify" =~ \.enc$ ]]; then
            if gzip -t "$file_to_verify" 2>/dev/null; then
                log_info "Backup file integrity verified"
            else
                log_error "Backup file is corrupted"
                exit 1
            fi
        fi
    else
        log_error "Backup file not found: $file_to_verify"
        exit 1
    fi
}

send_notification() {
    local status="$1"
    local message="$2"
    
    # Slack notification
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"*PostgreSQL Backup ${status}*\\n${message}\"}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
    
    # Email notification
    if [[ -n "${ALERT_EMAIL:-}" ]]; then
        echo "$message" | mail -s "PostgreSQL Backup ${status}" "$ALERT_EMAIL" || true
    fi
}

#-------------------------------------------------------------------------------
# Main Execution
#-------------------------------------------------------------------------------

main() {
    log_info "========================================="
    log_info "Starting PostgreSQL Backup Process"
    log_info "========================================="
    
    # Pre-flight checks
    check_dependencies
    setup_backup_dir
    
    # Create backup
    create_backup
    verify_backup
    
    # Encrypt if key is provided
    encrypt_backup
    
    # Upload to S3
    upload_to_s3
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Send success notification
    send_notification "SUCCESS" "PostgreSQL backup completed successfully. File: ${BACKUP_FILE}"
    
    log_info "========================================="
    log_info "Backup Process Completed Successfully"
    log_info "========================================="
}

# Error handling
trap 'log_error "Backup failed with error"; send_notification "FAILED" "PostgreSQL backup failed. Check logs for details."' ERR

# Run main function
main "$@"
