# Backup Procedure

## Overview

This document describes the backup procedures for KPTEST production environment, including database backups, configuration backups, and backup verification processes.

---

## Backup Schedule

| Component | Frequency | Time (UTC) | Retention | Storage |
|-----------|-----------|------------|-----------|---------|
| PostgreSQL (full) | Daily | 02:00 | 30 days | S3 + Local |
| PostgreSQL (incremental) | Hourly | :00 | 7 days | S3 |
| Kubernetes Configs | On change | - | 90 days | Git + S3 |
| Application Logs | Continuous | - | 31 days | Loki |
| Metrics Data | Continuous | - | 90 days | Prometheus |

---

## Backup Scripts

### Database Backup

**Location**: `/home/user1/KPTESTPRO/scripts/backup-db.sh`

```bash
# Run database backup
./scripts/backup-db.sh

# With custom retention
RETENTION_DAYS=14 ./scripts/backup-db.sh

# With encryption
ENCRYPTION_KEY="your-secret-key" ./scripts/backup-db.sh
```

### S3 Backup Management

**Location**: `/home/user1/KPTESTPRO/scripts/backup-s3.sh`

```bash
# Upload backup to S3
./scripts/backup-s3.sh upload /var/backups/kptest/backup.sql.gz

# List backups
./scripts/backup-s3.sh list

# Cleanup old backups
./scripts/backup-s3.sh cleanup

# Verify backup
./scripts/backup-s3.sh verify postgresql/20260424_020000/backup.sql.gz
```

---

## Cron Configuration

### Production Cron Jobs

```cron
# Database backup - daily at 02:00 UTC
0 2 * * * /home/user1/KPTESTPRO/scripts/backup-db.sh >> /var/log/kptest/backup.log 2>&1

# Hourly backup to S3
0 * * * * /home/user1/KPTESTPRO/scripts/backup-s3.sh sync /var/backups/kptest/ >> /var/log/kptest/s3-sync.log 2>&1

# Weekly cleanup - Sunday at 03:00 UTC
0 3 * * 0 /home/user1/KPTESTPRO/scripts/backup-s3.sh cleanup >> /var/log/kptest/cleanup.log 2>&1

# Monthly backup report - 1st of month at 04:00 UTC
0 4 1 * * /home/user1/KPTESTPRO/scripts/backup-s3.sh report >> /var/log/kptest/report.log 2>&1
```

---

## Backup Verification

### Daily Verification

```bash
# Check backup file exists and is not empty
ls -lh /var/backups/kptest/kptest_backup_*.sql.gz

# Verify gzip integrity
gzip -t /var/backups/kptest/kptest_backup_latest.sql.gz

# Check S3 upload
aws s3 ls s3://kptest-backups-production/postgresql/ --human-readable | tail -5
```

### Weekly Restore Test

```bash
# Download latest backup
aws s3 cp s3://kptest-backups-production/postgresql/latest/ \
  /tmp/restore-test/ --recursive

# Restore to test database
PGPASSWORD=testpass psql -h localhost -U postgres -c "DROP DATABASE IF EXISTS kptest_test;"
PGPASSWORD=testpass psql -h localhost -U postgres -c "CREATE DATABASE kptest_test;"
gunzip -c /tmp/restore-test/kptest_backup_latest.sql.gz | \
  PGPASSWORD=testpass psql -h localhost -U postgres -d kptest_test

# Verify row counts
psql -h localhost -U postgres -d kptest_test -c "
  SELECT 'users' as table_name, COUNT(*) as row_count FROM users
  UNION ALL
  SELECT 'patients', COUNT(*) FROM patients
  UNION ALL
  SELECT 'projects', COUNT(*) FROM projects;"
```

---

## Backup Storage

### S3 Bucket Structure

```
s3://kptest-backups-production/
├── postgresql/
│   ├── 20260424_020000/
│   │   └── kptest_backup_20260424_020000.sql.gz
│   ├── 20260425_020000/
│   │   └── kptest_backup_20260425_020000.sql.gz
│   └── latest/
│       └── kptest_backup_latest.sql.gz
├── kubernetes/
│   └── configs/
└── logs/
```

### Local Backup Directory

```
/var/backups/kptest/
├── postgresql/
│   └── kptest_backup_YYYYMMDD_HHMMSS.sql.gz
├── kubernetes/
└── logs/
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Resolution |
|-------|-------|------------|
| Backup fails | Database connection error | Check DB_HOST, DB_PASSWORD |
| S3 upload fails | AWS credentials | Verify AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY |
| Backup too large | No compression | Ensure gzip compression is enabled |
| Restore fails | Encryption key mismatch | Verify ENCRYPTION_KEY matches backup |

---

**Document Version**: 1.0  
**Last Updated**: 2026-04-24
