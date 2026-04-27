# Maintenance Guide

## Overview

This guide describes the maintenance procedures for the KPTEST system, including scheduled maintenance, routine tasks, and preventive measures.

## Maintenance Schedule

### Daily Tasks

| Task | Time | Owner | Duration |
|------|------|-------|----------|
| Review overnight alerts | 09:00 | On-call | 15 min |
| Check backup status | 09:30 | On-call | 10 min |
| Review error logs | 10:00 | DevOps | 30 min |

### Weekly Tasks

| Task | Day | Owner | Duration |
|------|-----|-------|----------|
| Security patch review | Monday | DevOps | 1 hour |
| Performance review | Tuesday | DevOps | 1 hour |
| Capacity planning | Wednesday | DevOps | 1 hour |
| Log rotation verification | Thursday | DevOps | 30 min |
| Certificate expiry check | Friday | DevOps | 30 min |

### Monthly Tasks

| Task | Week | Owner | Duration |
|------|------|-------|----------|
| Dependency updates | Week 1 | Backend | 2 hours |
| Database maintenance | Week 2 | DBA | 4 hours |
| Security audit | Week 3 | Security | 4 hours |
| DR test | Week 4 | DevOps | 4 hours |

### Quarterly Tasks

| Task | Owner | Duration |
|------|-------|----------|
| Full DR exercise | DevOps + Team | 1 day |
| Security penetration test | External | 2 days |
| Capacity review | DevOps + Management | 4 hours |
| Runbook review | Team | 2 hours |

## Routine Maintenance

### Database Maintenance

#### Weekly Vacuum

```bash
#!/bin/bash
# weekly-vacuum.sh

NAMESPACE="kptest-production"

echo "Starting weekly vacuum..."

# Vacuum analyze all tables
kubectl exec -n ${NAMESPACE} deployment/kptest-postgresql -- \
  psql -c "VACUUM ANALYZE;"

echo "Vacuum completed"

# Check table bloat
kubectl exec -n ${NAMESPACE} deployment/kptest-postgresql -- \
  psql -c "SELECT schemaname, relname, n_dead_tup, n_live_tup, 
                  round(100.0 * n_dead_tup / nullif(n_live_tup + n_dead_tup, 0), 2) as dead_pct
           FROM pg_stat_user_tables 
           WHERE n_dead_tup > 1000
           ORDER BY n_dead_tup DESC;"
```

#### Monthly Index Maintenance

```bash
#!/bin/bash
# monthly-index-maintenance.sh

NAMESPACE="kptest-production"

echo "Starting index maintenance..."

# Reindex system tables
kubectl exec -n ${NAMESPACE} deployment/kptest-postgresql -- \
  psql -c "REINDEX SYSTEM kptest;"

# Check for unused indexes
kubectl exec -n ${NAMESPACE} deployment/kptest-postgresql -- \
  psql -c "SELECT schemaname, tablename, indexname, idx_scan 
           FROM pg_stat_user_indexes 
           WHERE idx_scan = 0 
           AND indexname NOT LIKE '%_pkey'
           ORDER BY schemaname, tablename;"

echo "Index maintenance completed"
```

#### Quarterly Statistics Update

```bash
#!/bin/bash
# quarterly-stats-update.sh

NAMESPACE="kptest-production"

echo "Updating database statistics..."

# Analyze all tables
kubectl exec -n ${NAMESPACE} deployment/kptest-postgresql -- \
  psql -c "ANALYZE VERBOSE;"

echo "Statistics update completed"
```

### Application Maintenance

#### Dependency Updates

```bash
#!/bin/bash
# update-dependencies.sh

# Backend (Gradle)
cd backend
./gradlew dependencyUpdates
# Review report and update versions in build.gradle
./gradlew build
./gradlew test

# Frontend (npm)
cd frontend
npm outdated
# Review and update package.json
npm install
npm test

# Mobile (npm)
cd mobile
npm outdated
# Review and update package.json
npm install
npm test
```

#### Cache Cleanup

```bash
#!/bin/bash
# cleanup-cache.sh

NAMESPACE="kptest-production"

echo "Clearing Redis cache..."

# Clear specific keys (safe)
kubectl exec -n ${NAMESPACE} deployment/kptest-redis -- \
  redis-cli KEYS "cache:*" | xargs -r redis-cli DEL

# Or full flush (use with caution)
# kubectl exec -n ${NAMESPACE} deployment/kptest-redis -- \
#   redis-cli FLUSHDB

echo "Cache cleanup completed"
```

### Infrastructure Maintenance

#### Node Maintenance

```bash
#!/bin/bash
# node-maintenance.sh

# Cordon node
kubectl cordon <node-name>

# Drain workloads
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# Perform maintenance (OS updates, etc.)
# ...

# Uncordon node
kubectl uncordon <node-name>
```

#### Certificate Renewal

```bash
#!/bin/bash
# renew-certificates.sh

# Check certificate expiry
kubectl get certificates -n kptest-production

# Renew cert-manager certificates
kubectl cert-manager renew kptest-tls -n kptest-production

# Verify renewal
kubectl get certificates -n kptest-production
```

## Scheduled Downtime

### Maintenance Window

**Standard Window:** Sunday 02:00-06:00 CET

**Notification Timeline:**
- 1 week before: Email to stakeholders
- 3 days before: Status page update
- 1 day before: Reminder email
- 1 hour before: Final reminder

### Maintenance Procedure

```bash
#!/bin/bash
# scheduled-maintenance.sh

echo "=== Starting Scheduled Maintenance ==="
echo "Time: $(date)"

# 1. Enable maintenance mode
echo "Enabling maintenance mode..."
kubectl patch configmap kptest-config -n kptest-production \
  --type=json -p='[{"op": "replace", "path": "/data/maintenance-mode", "value": "true"}]'

# 2. Create backup
echo "Creating pre-maintenance backup..."
./scripts/backup-production.sh pre-maintenance-$(date +%Y%m%d)

# 3. Perform maintenance tasks
echo "Performing maintenance tasks..."
# ... specific tasks ...

# 4. Verify system
echo "Verifying system..."
./scripts/verify-deployment.sh production

# 5. Disable maintenance mode
echo "Disabling maintenance mode..."
kubectl patch configmap kptest-config -n kptest-production \
  --type=json -p='[{"op": "replace", "path": "/data/maintenance-mode", "value": "false"}]'

echo "=== Maintenance Complete ==="
```

## Preventive Measures

### Security Patches

#### OS Security Updates

```bash
#!/bin/bash
# security-updates.sh

# For each node in cluster
for node in $(kubectl get nodes -o jsonpath='{.items[*].metadata.name}'); do
    echo "Updating node: $node"
    
    # Cordon node
    kubectl cordon $node
    
    # Drain workloads
    kubectl drain $node --ignore-daemonsets --delete-emptydir-data
    
    # Apply updates (via cloud provider or SSH)
    # AWS: Use SSM Run Command
    # GCP: Use OS Config
    # Azure: Use Automation Accounts
    
    # Reboot if needed
    # ...
    
    # Uncordon node
    kubectl uncordon $node
    
    # Wait for node to be ready
    kubectl wait --for=condition=ready node/$node --timeout=300s
done
```

#### Application Security Updates

```bash
#!/bin/bash
# app-security-updates.sh

# Check for security vulnerabilities
cd backend
./gradlew dependencyCheckAnalyze

cd ../frontend
npm audit

cd ../mobile
npm audit

# Review and fix critical/high vulnerabilities
# Update vulnerable dependencies
# Run tests
# Deploy to staging
# Deploy to production
```

### Capacity Management

#### Resource Review

```bash
#!/bin/bash
# capacity-review.sh

echo "=== Capacity Review ==="

# CPU usage
echo "CPU Usage by Namespace:"
kubectl top pods --all-namespaces --sort-by=cpu

# Memory usage
echo "Memory Usage by Namespace:"
kubectl top pods --all-namespaces --sort-by=memory

# Storage usage
echo "Storage Usage:"
kubectl get pvc --all-namespaces

# Check HPA status
echo "HPA Status:"
kubectl get hpa --all-namespaces
```

#### Scaling Recommendations

Based on review:

| Metric | Threshold | Action |
|--------|-----------|--------|
| CPU > 70% | Sustained | Increase replicas |
| Memory > 80% | Sustained | Increase limits |
| Disk > 70% | Any | Expand storage |
| Queue depth > 100 | Sustained | Scale consumers |

## Monitoring Maintenance

### Maintenance Metrics

Track these metrics:

```yaml
# Maintenance metrics to track
maintenance:
  scheduled_downtime_hours: "Target: < 4 hours/month"
  unplanned_downtime_hours: "Target: < 1 hour/month"
  backup_success_rate: "Target: 100%"
  patch_compliance: "Target: > 95%"
  certificate_renewal_on_time: "Target: 100%"
```

### Maintenance Dashboard

Create Grafana dashboard with:
- Scheduled vs unplanned downtime
- Backup success/failure
- Security patch status
- Certificate expiry timeline
- Capacity trends

## Documentation

### Runbook Updates

After each maintenance:
1. Update runbooks with any new procedures
2. Document any issues encountered
3. Update contact information if changed
4. Review and update alerts if needed

### Change Log

Maintain change log:

```markdown
# Maintenance Change Log

## 2026-04-24
- Updated PostgreSQL from 15.1 to 15.2
- Renewed SSL certificates
- Increased backend replicas to 5

## 2026-04-17
- Applied security patches to nodes
- Cleaned up old database backups
- Updated dependency versions
```

---

**Last Updated:** 2026-04-24
**Version:** 1.0.0
