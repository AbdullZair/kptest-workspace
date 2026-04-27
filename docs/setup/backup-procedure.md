# Backup Procedure Guide

## Overview

This guide describes the backup and restore procedures for the KPTEST system, including database backups, file backups, and disaster recovery processes.

## Backup Strategy

### Backup Types

| Type | Frequency | Retention | Storage |
|------|-----------|-----------|---------|
| Full Database Backup | Daily (2 AM) | 30 days | S3 + Local |
| Incremental Backup | Hourly | 7 days | Local |
| File Storage Backup | Daily (3 AM) | 30 days | S3 |
| Configuration Backup | On change | 90 days | S3 + Git |

### RPO/RTO Targets

| Metric | Target | Description |
|--------|--------|-------------|
| RPO (Recovery Point Objective) | 1 hour | Maximum data loss |
| RTO (Recovery Time Objective) | 4 hours | Maximum downtime |

## Database Backup

### Automated Daily Backup

```yaml
# Kubernetes CronJob
apiVersion: batch/v1
kind: CronJob
metadata:
  name: kptest-database-backup
  namespace: kptest-production
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:15
            command:
            - /bin/sh
            - -c
            - |
              echo "Starting backup at $(date)"
              
              # Create backup directory
              mkdir -p /backup/daily
              
              # Full database backup
              pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
                --format=custom \
                --compress=9 \
                --verbose \
                > /backup/daily/backup-$(date +\%Y\%m\%d).dump
              
              # Verify backup
              if [ $? -eq 0 ]; then
                echo "Backup completed successfully"
                
                # Upload to S3
                aws s3 cp /backup/daily/ \
                  s3://kptest-backups/database/daily/ \
                  --recursive
                  
                # Cleanup old local backups
                find /backup/daily -mtime +7 -delete
              else
                echo "Backup failed"
                exit 1
              fi
            env:
            - name: DB_HOST
              value: "kptest-postgresql.kptest-production.svc"
            - name: DB_USER
              valueFrom:
                secretKeyRef:
                  name: kptest-secrets
                  key: database-username
            - name: DB_NAME
              value: "kptest"
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: kptest-secrets
                  key: database-password
            - name: AWS_ACCESS_KEY_ID
              valueFrom:
                secretKeyRef:
                  name: aws-credentials
                  key: access-key-id
            - name: AWS_SECRET_ACCESS_KEY
              valueFrom:
                secretKeyRef:
                  name: aws-credentials
                  key: secret-access-key
            volumeMounts:
            - name: backup-volume
              mountPath: /backup
          volumes:
          - name: backup-volume
            persistentVolumeClaim:
              claimName: kptest-backup-pvc
          restartPolicy: OnFailure
```

### Manual Backup

```bash
#!/bin/bash
# manual-backup.sh

BACKUP_DIR="/backup/manual"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_manual_${TIMESTAMP}.dump"

# Database credentials
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="kptest"
DB_USER="kptest_user"

echo "Starting manual backup at $(date)"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Full database backup
pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_NAME} \
  --format=custom \
  --compress=9 \
  --verbose \
  --file=${BACKUP_FILE}

if [ $? -eq 0 ]; then
  echo "Backup completed: ${BACKUP_FILE}"
  
  # Calculate checksum
  sha256sum ${BACKUP_FILE} > ${BACKUP_FILE}.sha256
  
  # Upload to S3
  aws s3 cp ${BACKUP_FILE} s3://kptest-backups/database/manual/
  aws s3 cp ${BACKUP_FILE}.sha256 s3://kptest-backups/database/manual/
  
  echo "Backup uploaded to S3"
else
  echo "Backup failed!"
  exit 1
fi
```

### Backup Verification

```bash
#!/bin/bash
# verify-backup.sh

BACKUP_FILE=$1

if [ -z "${BACKUP_FILE}" ]; then
  echo "Usage: verify-backup.sh <backup-file>"
  exit 1
fi

echo "Verifying backup: ${BACKUP_FILE}"

# Verify file exists
if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Backup file not found"
  exit 1
fi

# Verify checksum
if [ -f "${BACKUP_FILE}.sha256" ]; then
  sha256sum -c ${BACKUP_FILE}.sha256
  if [ $? -ne 0 ]; then
    echo "Checksum verification failed!"
    exit 1
  fi
fi

# Test restore to temporary database
TEMP_DB="backup_verify_$$"
echo "Testing restore to temporary database: ${TEMP_DB}"

createdb -h localhost -U kptest_user ${TEMP_DB}
pg_restore -h localhost -U kptest_user -d ${TEMP_DB} ${BACKUP_FILE}

if [ $? -eq 0 ]; then
  echo "Restore test successful"
  
  # Verify table count
  TABLE_COUNT=$(psql -h localhost -U kptest_user -d ${TEMP_DB} -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'kptest'")
  echo "Tables restored: ${TABLE_COUNT}"
  
  # Cleanup
  dropdb -h localhost -U kptest_user ${TEMP_DB}
else
  echo "Restore test failed!"
  exit 1
fi

echo "Backup verification completed successfully"
```

## File Storage Backup

### S3 Backup Configuration

```bash
#!/bin/bash
# backup-files.sh

SOURCE_DIR="/data/files"
BACKUP_BUCKET="s3://kptest-backups/files"
TIMESTAMP=$(date +%Y%m%d)

echo "Starting file backup at $(date)"

# Sync files to S3
aws s3 sync ${SOURCE_DIR} ${BACKUP_BUCKET}/${TIMESTAMP}/ \
  --delete \
  --storage-class STANDARD_IA

if [ $? -eq 0 ]; then
  echo "File backup completed"
  
  # Create manifest
  aws s3 ls ${BACKUP_BUCKET}/${TIMESTAMP}/ --recursive \
    > /tmp/manifest-${TIMESTAMP}.txt
  aws s3 cp /tmp/manifest-${TIMESTAMP}.txt \
    ${BACKUP_BUCKET}/${TIMESTAMP}/manifest.txt
  
  # Cleanup old backups (keep 30 days)
  aws s3 ls ${BACKUP_BUCKET}/ | \
    awk -v date=${TIMESTAMP} '{if ($1 < date-30) print $4}' | \
    xargs -I {} aws s3 rm ${BACKUP_BUCKET}/{} --recursive
else
  echo "File backup failed"
  exit 1
fi
```

## Restore Procedures

### Database Restore

```bash
#!/bin/bash
# restore-database.sh

BACKUP_FILE=$1
TARGET_DB=${2:-kptest}

if [ -z "${BACKUP_FILE}" ]; then
  echo "Usage: restore-database.sh <backup-file> [target-database]"
  exit 1
fi

echo "WARNING: This will restore database '${TARGET_DB}' from '${BACKUP_FILE}'"
echo "All existing data will be lost!"
read -p "Type 'CONFIRM' to proceed: " confirmation

if [ "${confirmation}" != "CONFIRM" ]; then
  echo "Restore cancelled"
  exit 0
fi

# Download from S3 if needed
if [[ "${BACKUP_FILE}" == s3://* ]]; then
  echo "Downloading backup from S3..."
  aws s3 cp ${BACKUP_FILE} /tmp/restore.dump
  BACKUP_FILE="/tmp/restore.dump"
fi

# Put system in maintenance mode
echo "Putting system in maintenance mode..."
kubectl patch configmap kptest-config -n kptest-production \
  --type=json -p='[{"op": "replace", "path": "/data/maintenance-mode", "value": "true"}]'

# Drop and recreate database
echo "Recreating database..."
dropdb -h localhost -U kptest_user ${TARGET_DB}
createdb -h localhost -U kptest_user ${TARGET_DB}

# Restore from backup
echo "Restoring from backup..."
pg_restore -h localhost -U kptest_user -d ${TARGET_DB} \
  --verbose \
  ${BACKUP_FILE}

if [ $? -eq 0 ]; then
  echo "Database restore completed"
  
  # Run migrations if needed
  echo "Running pending migrations..."
  kubectl exec -n kptest-production deployment/kptest-backend -- \
    java -jar /app/backend.jar --flyway.migrate
  
  # Clear cache
  echo "Clearing Redis cache..."
  kubectl exec -n kptest-production deployment/kptest-redis -- \
    redis-cli FLUSHALL
  
  # Take system out of maintenance mode
  kubectl patch configmap kptest-config -n kptest-production \
    --type=json -p='[{"op": "replace", "path": "/data/maintenance-mode", "value": "false"}]'
  
  echo "System restored and online"
else
  echo "Restore failed!"
  exit 1
fi
```

### Point-in-Time Recovery

```bash
#!/bin/bash
# point-in-time-recovery.sh

TARGET_TIME=$1

if [ -z "${TARGET_TIME}" ]; then
  echo "Usage: point-in-time-recovery.sh 'YYYY-MM-DD HH:MM:SS'"
  exit 1
fi

echo "Finding backup before ${TARGET_TIME}..."

# Find appropriate backup
BACKUP_FILE=$(aws s3 ls s3://kptest-backups/database/daily/ \
  --recursive \
  | awk -v target="${TARGET_TIME}" '
      {
        split($1, date, "-");
        split($2, time, ":");
        backup_time = date[1] date[2] date[3] time[1] time[2] time[3];
        if (backup_time < target) {
          latest = $4;
        }
      }
      END { print latest }
    ')

if [ -z "${BACKUP_FILE}" ]; then
  echo "No suitable backup found"
  exit 1
fi

echo "Using backup: ${BACKUP_FILE}"

# Restore from backup
./restore-database.sh "s3://kptest-backups/database/daily/${BACKUP_FILE}"

# Apply WAL logs up to target time
echo "Applying WAL logs up to ${TARGET_TIME}..."
# Implementation depends on WAL archiving setup

echo "Point-in-time recovery completed"
```

## Backup Monitoring

### Backup Status Check

```bash
#!/bin/bash
# check-backup-status.sh

echo "=== Backup Status Report ==="
echo "Generated at: $(date)"
echo ""

# Check latest database backup
echo "Latest Database Backups:"
aws s3 ls s3://kptest-backups/database/daily/ \
  --recursive \
  | sort -r \
  | head -5

echo ""

# Check backup age
LATEST_BACKUP=$(aws s3 ls s3://kptest-backups/database/daily/ \
  --recursive \
  | sort -r \
  | head -1 \
  | awk '{print $1}')

BACKUP_DATE=$(echo ${LATEST_BACKUP} | tr '-' '')
TODAY=$(date +%Y%m%d)
AGE_DAYS=$(( (TODAY - BACKUP_DATE) ))

echo "Latest backup age: ${AGE_DAYS} days"

if [ ${AGE_DAYS} -gt 1 ]; then
  echo "WARNING: Backup is older than 1 day!"
fi

echo ""

# Check backup size
echo "Backup Storage Usage:"
aws s3 ls s3://kptest-backups/ \
  --recursive \
  --human-readable \
  --summarize
```

### Alert Configuration

```yaml
# Prometheus alert rules
groups:
- name: backup
  rules:
  - alert: BackupMissing
    expr: |
      time() - 
      (label_replace(
        max(kustomize_resource_annotations{annotation_backup_date!=""}), 
        "backup_date", "$1", "annotation_backup_date", "(.*)"
      ) * 86400) > 90000
    for: 1h
    labels:
      severity: critical
    annotations:
      summary: "Database backup missing for more than 25 hours"
      
  - alert: BackupSizeAnomaly
    expr: |
      abs(delta(backup_size_bytes[1d])) / 
      backup_size_bytes > 0.5
    for: 1h
    labels:
      severity: warning
    annotations:
      summary: "Backup size changed significantly"
      
  - alert: BackupRestoreFailed
    expr: sum(backup_restore_failures) > 0
    for: 0m
    labels:
      severity: critical
    annotations:
      summary: "Backup restore test failed"
```

## Disaster Recovery

See [Disaster Recovery Guide](./disaster-recovery.md) for complete DR procedures.

---

**Last Updated:** 2026-04-24
**Version:** 1.0.0
