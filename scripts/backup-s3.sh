#!/bin/bash
#===============================================================================
# KPTEST S3 Backup Management Script
# Upload, manage, and verify backups in Amazon S3
#===============================================================================

set -euo pipefail

#-------------------------------------------------------------------------------
# Configuration
#-------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/kptest}"
S3_BUCKET="${S3_BACKUP_BUCKET:-kptest-backups-production}"
S3_PREFIX="${S3_PREFIX:-backups}"
AWS_REGION="${AWS_REGION:-eu-central-1}"
AWS_PROFILE="${AWS_PROFILE:-default}"

# Retention settings
DAILY_RETENTION="${DAILY_RETENTION:-7}"      # Days to keep daily backups
WEEKLY_RETENTION="${WEEKLY_RETENTION:-4}"     # Weeks to keep weekly backups
MONTHLY_RETENTION="${MONTHLY_RETENTION:-12}"  # Months to keep monthly backups

# Logging
LOG_FILE="${LOG_FILE:-/var/log/kptest/s3-backup-$(date +%Y%m%d).log}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

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
Usage: $(basename "$0") COMMAND [OPTIONS]

S3 Backup Management Commands:
    upload PATH              Upload backup file/directory to S3
    list [PREFIX]            List backups in S3
    download KEY DEST        Download backup from S3
    delete KEY               Delete backup from S3
    cleanup                  Apply retention policy and clean old backups
    verify KEY               Verify backup integrity
    sync LOCAL_DIR           Sync local backup directory with S3

Options:
    -b, --bucket BUCKET      S3 bucket name
    -p, --prefix PREFIX      S3 prefix/folder
    -r, --region REGION      AWS region
    -n, --dry-run            Show what would be done without executing
    -h, --help               Show this help message

Examples:
    # Upload a backup file
    $(basename "$0") upload /var/backups/kptest/backup.sql.gz

    # List all backups
    $(basename "$0") list

    # Cleanup old backups
    $(basename "$0") cleanup

    # Sync local directory with S3
    $(basename "$0") sync /var/backups/kptest/

EOF
    exit 1
}

check_dependencies() {
    local deps=("aws" "s3cmd")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            if [[ "$dep" != "s3cmd" ]]; then  # s3cmd is optional
                log_error "Required dependency not found: $dep"
                exit 1
            fi
        fi
    done
    
    # Verify AWS credentials
    if ! aws sts get-caller-identity &>/dev/null; then
        log_error "AWS credentials not configured or invalid"
        exit 1
    fi
    
    log_info "Dependencies check passed"
}

verify_bucket() {
    if ! aws s3api head-bucket --bucket "$S3_BUCKET" &>/dev/null; then
        log_error "Bucket '$S3_BUCKET' does not exist or is not accessible"
        exit 1
    fi
    log_info "Bucket verified: s3://${S3_BUCKET}"
}

upload_backup() {
    local source="$1"
    
    if [[ ! -e "$source" ]]; then
        log_error "Source file/directory not found: $source"
        exit 1
    fi
    
    log_info "Uploading: $source"
    
    if [[ -d "$source" ]]; then
        # Upload directory
        aws s3 sync "$source" "s3://${S3_BUCKET}/${S3_PREFIX}/${TIMESTAMP}/" \
            --storage-class STANDARD_IA \
            --server-side-encryption AES256 \
            --metadata "upload-type=directory,source=$(basename "$source")"
    else
        # Upload single file
        local filename=$(basename "$source")
        aws s3 cp "$source" "s3://${S3_BUCKET}/${S3_PREFIX}/${TIMESTAMP}/${filename}" \
            --storage-class STANDARD_IA \
            --server-side-encryption AES256 \
            --metadata "upload-type=file,source=${filename}"
    fi
    
    log_info "Upload completed"
}

list_backups() {
    local prefix="${1:-$S3_PREFIX}"
    
    log_info "Listing backups in s3://${S3_BUCKET}/${prefix}/"
    
    aws s3 ls "s3://${S3_BUCKET}/${prefix}/" --recursive --human-readable --summarize | \
        head -100
    
    # Summary by month
    log_info "Backup summary by month:"
    aws s3 ls "s3://${S3_BUCKET}/${prefix}/" --recursive | \
        awk '{print $1, $2, $4}' | \
        cut -d'-' -f1,2 | \
        sort | \
        uniq -c | \
        tail -20
}

download_backup() {
    local key="$1"
    local destination="$2"
    
    log_info "Downloading: s3://${S3_BUCKET}/${key}"
    log_info "Destination: $destination"
    
    aws s3 cp "s3://${S3_BUCKET}/${key}" "$destination"
    
    log_info "Download completed"
}

delete_backup() {
    local key="$1"
    
    log_warn "Deleting: s3://${S3_BUCKET}/${key}"
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log_info "Dry run - would delete: s3://${S3_BUCKET}/${key}"
        return
    fi
    
    aws s3 rm "s3://${S3_BUCKET}/${key}"
    
    log_info "Deletion completed"
}

cleanup_old_backups() {
    log_info "Starting backup cleanup with retention policy"
    log_info "Daily retention: ${DAILY_RETENTION} days"
    log_info "Weekly retention: ${WEEKLY_RETENTION} weeks"
    log_info "Monthly retention: ${MONTHLY_RETENTION} months"
    
    local now=$(date +%s)
    local deleted_count=0
    local kept_count=0
    
    # Get all backup folders
    aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | \
        grep -E '^PRE' | \
        awk '{print $2}' | \
        while read -r folder; do
        
        # Extract date from folder name (expecting YYYYMMDD_HHMMSS format)
        local folder_date=$(echo "$folder" | grep -oE '[0-9]{8}_[0-9]{6}' | head -1)
        
        if [[ -z "$folder_date" ]]; then
            log_warn "Skipping folder with invalid date format: $folder"
            continue
        fi
        
        # Calculate age in days
        local folder_timestamp=$(date -d "${folder_date/_/ }" +%s 2>/dev/null || echo "0")
        local age_days=$(( (now - folder_timestamp) / 86400 ))
        
        # Determine retention based on backup age
        local keep=false
        local reason=""
        
        # Daily backups (keep last N days)
        if [[ $age_days -le $DAILY_RETENTION ]]; then
            keep=true
            reason="daily"
        fi
        
        # Weekly backups (keep first backup of each week)
        local day_of_week=$(date -d "${folder_date/_/ }" +%u 2>/dev/null || echo "0")
        if [[ $age_days -le $((WEEKLY_RETENTION * 7)) ]] && [[ $day_of_week -eq 1 ]]; then
            keep=true
            reason="weekly"
        fi
        
        # Monthly backups (keep first backup of each month)
        local day_of_month=$(date -d "${folder_date/_/ }" +%d 2>/dev/null || echo "0")
        if [[ $age_days -le $((MONTHLY_RETENTION * 30)) ]] && [[ $day_of_month -eq 01 ]]; then
            keep=true
            reason="monthly"
        fi
        
        if [[ "$keep" == "true" ]]; then
            log_info "KEEP [$reason]: $folder (${age_days} days old)"
            ((kept_count++))
        else
            log_info "DELETE: $folder (${age_days} days old)"
            
            if [[ "${DRY_RUN:-false}" != "true" ]]; then
                aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${folder}" --recursive
                log_info "Deleted folder: $folder"
            fi
            ((deleted_count++))
        fi
    done
    
    log_info "Cleanup completed. Kept: $kept_count, Deleted: $deleted_count"
}

verify_backup() {
    local key="$1"
    
    log_info "Verifying backup: s3://${S3_BUCKET}/${key}"
    
    # Check if file exists
    if ! aws s3api head-object --bucket "$S3_BUCKET" --key "$key" &>/dev/null; then
        log_error "Backup not found: $key"
        exit 1
    fi
    
    # Get file metadata
    local metadata=$(aws s3api head-object --bucket "$S3_BUCKET" --key "$key")
    local size=$(echo "$metadata" | jq -r '.ContentLength')
    local storage_class=$(echo "$metadata" | jq -r '.StorageClass')
    local encryption=$(echo "$metadata" | jq -r '.ServerSideEncryption')
    
    log_info "Size: $size bytes"
    log_info "Storage Class: $storage_class"
    log_info "Encryption: $encryption"
    
    # Download and verify checksum (if not too large)
    if [[ $size -lt 1073741824 ]]; then  # Less than 1GB
        local temp_file=$(mktemp)
        
        aws s3 cp "s3://${S3_BUCKET}/${key}" "$temp_file"
        
        if [[ -f "$temp_file" ]]; then
            if file "$temp_file" | grep -q "gzip compressed"; then
                if gzip -t "$temp_file" 2>/dev/null; then
                    log_info "Backup integrity verified: OK"
                else
                    log_error "Backup integrity check FAILED: File is corrupted"
                    exit 1
                fi
            else
                log_info "Backup is not a gzip file, skipping integrity check"
            fi
            rm -f "$temp_file"
        fi
    else
        log_warn "File too large for download verification (>1GB)"
    fi
}

sync_backups() {
    local local_dir="$1"
    
    if [[ ! -d "$local_dir" ]]; then
        log_error "Local directory not found: $local_dir"
        exit 1
    fi
    
    log_info "Syncing: $local_dir -> s3://${S3_BUCKET}/${S3_PREFIX}/"
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        aws s3 sync "$local_dir" "s3://${S3_BUCKET}/${S3_PREFIX}/" --dryrun
    else
        aws s3 sync "$local_dir" "s3://${S3_BUCKET}/${S3_PREFIX}/" \
            --storage-class STANDARD_IA \
            --server-side-encryption AES256
    fi
    
    log_info "Sync completed"
}

generate_report() {
    log_info "Generating backup report"
    
    local report_file="/tmp/s3-backup-report-${TIMESTAMP}.txt"
    
    {
        echo "========================================="
        echo "S3 Backup Report"
        echo "Generated: $(date)"
        echo "Bucket: s3://${S3_BUCKET}/${S3_PREFIX}/"
        echo "========================================="
        echo ""
        
        echo "Storage Usage:"
        aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" --recursive --summarize | tail -2
        echo ""
        
        echo "Recent Backups (last 10):"
        aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" --recursive --human-readable | tail -10
        echo ""
        
        echo "Backups by Month:"
        aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" --recursive | \
            awk '{print $1, $2}' | cut -d'-' -f1,2 | sort | uniq -c
        echo ""
        
    } > "$report_file"
    
    cat "$report_file"
    log_info "Report saved to: $report_file"
}

#-------------------------------------------------------------------------------
# Main Execution
#-------------------------------------------------------------------------------

main() {
    if [[ $# -lt 1 ]]; then
        usage
    fi
    
    # Parse global options
    while [[ $# -gt 0 ]]; do
        case $1 in
            -b|--bucket)
                S3_BUCKET="$2"
                shift 2
                ;;
            -p|--prefix)
                S3_PREFIX="$2"
                shift 2
                ;;
            -r|--region)
                AWS_REGION="$2"
                shift 2
                ;;
            -n|--dry-run)
                DRY_RUN="true"
                shift
                ;;
            -h|--help)
                usage
                ;;
            upload|list|download|delete|cleanup|verify|sync|report)
                COMMAND="$1"
                shift
                break
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                ;;
        esac
    done
    
    # Pre-flight checks
    check_dependencies
    verify_bucket
    
    # Execute command
    case ${COMMAND:-} in
        upload)
            upload_backup "$@"
            ;;
        list)
            list_backups "$@"
            ;;
        download)
            download_backup "$@"
            ;;
        delete)
            delete_backup "$@"
            ;;
        cleanup)
            cleanup_old_backups
            ;;
        verify)
            verify_backup "$@"
            ;;
        sync)
            sync_backups "$@"
            ;;
        report)
            generate_report
            ;;
        *)
            log_error "Unknown command: ${COMMAND:-}"
            usage
            ;;
    esac
}

# Run main function
main "$@"
