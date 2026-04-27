# Rollback Procedure Guide

## Overview

This guide describes the procedures for rolling back KPTEST deployments in case of issues or failures. Rollback should be executed promptly when critical issues are detected post-deployment.

## Rollback Triggers

### When to Rollback

| Severity | Condition | Action |
|----------|-----------|--------|
| **Critical** | System outage | Immediate rollback |
| **Critical** | Data corruption | Immediate rollback |
| **High** | >10% error rate | Rollback within 15 min |
| **High** | Core feature broken | Rollback within 30 min |
| **Medium** | Performance degradation | Investigate, then decide |
| **Medium** | Non-critical bugs | Fix forward if possible |

### Decision Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Rollback Decision Tree                                │
│                                                                              │
│                          Issue Detected                                      │
│                                │                                             │
│                                ▼                                             │
│                    ┌─────────────────────┐                                  │
│                    │ Is system usable?   │                                  │
│                    └──────────┬──────────┘                                  │
│                               │                                              │
│              ┌────────────────┼────────────────┐                            │
│              │ NO             │                │ YES                         │
│              ▼                │                ▼                             │
│    ┌─────────────────┐        │    ┌─────────────────────┐                 │
│    │ CRITICAL IMPACT │        │    │ Assess impact level │                 │
│    │ Immediate       │        │    └──────────┬──────────┘                 │
│    │ Rollback        │        │               │                            │
│    └────────┬────────┘        │    ┌──────────┼──────────┐                │
│             │                 │    │          │          │                │
│             │                 │    ▼          ▼          ▼                │
│             │                 │ HIGH      MEDIUM     LOW                  │
│             │                 │  │          │          │                  │
│             │                 │  ▼          │          ▼                  │
│             │                 │ Rollback    │    Fix Forward              │
│             │                 │ within 15m  │    (patch)                  │
│             │                 └─────────────┴──────────┘                  │
│             │                                │                            │
│             └────────────────┬───────────────┘                            │
│                              │                                             │
│                              ▼                                             │
│                    Execute Rollback Procedure                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Pre-Rollback Checklist

Before executing rollback:

- [ ] Confirm issue is deployment-related
- [ ] Identify target version for rollback
- [ ] Notify team of rollback intent
- [ ] Verify backup is available
- [ ] Prepare communication for stakeholders
- [ ] Document current state for post-mortem

## Rollback Procedures

### Kubernetes Deployment Rollback

#### Quick Rollback (Last Version)

```bash
# Rollback backend to previous version
kubectl rollout undo deployment/kptest-backend -n kptest-production

# Rollback frontend to previous version
kubectl rollout undo deployment/kptest-frontend -n kptest-production

# Monitor rollback progress
kubectl rollout status deployment/kptest-backend -n kptest-production
kubectl rollout status deployment/kptest-frontend -n kptest-production
```

#### Rollback to Specific Revision

```bash
# View rollout history
kubectl rollout history deployment/kptest-backend -n kptest-production

# Output example:
# deployment.apps/kptest-backend
# REVISION  CHANGE-CAUSE
# 1         Initial deployment
# 2         Update to v1.2.0
# 3         Update to v1.2.1 (problematic)

# Rollback to specific revision
kubectl rollout undo deployment/kptest-backend -n kptest-production --to-revision=2

# Verify rollback
kubectl get pods -n kptest-production -l app=kptest-backend
```

### Full Rollback Script

```bash
#!/bin/bash
# rollback-production.sh

set -e

VERSION=${1:-"previous"}
NAMESPACE="kptest-production"

echo "=== KPTEST Production Rollback ==="
echo "Target: ${VERSION}"
echo "Time: $(date)"
echo ""

# Confirm rollback
read -p "Confirm rollback? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled"
    exit 1
fi

# Notify team
echo "Notifying team..."
./scripts/notify-slack.sh "🔄 Starting rollback to ${VERSION}"

# Rollback backend
echo "Rolling back backend..."
if [ "$VERSION" == "previous" ]; then
    kubectl rollout undo deployment/kptest-backend -n ${NAMESPACE}
else
    kubectl rollout undo deployment/kptest-backend -n ${NAMESPACE} --to-revision=${VERSION}
fi

# Wait for backend rollout
echo "Waiting for backend rollout..."
kubectl rollout status deployment/kptest-backend -n ${NAMESPACE} --timeout=300s

# Rollback frontend
echo "Rolling back frontend..."
if [ "$VERSION" == "previous" ]; then
    kubectl rollout undo deployment/kptest-frontend -n ${NAMESPACE}
else
    kubectl rollout undo deployment/kptest-frontend -n ${NAMESPACE} --to-revision=${VERSION}
fi

# Wait for frontend rollout
echo "Waiting for frontend rollout..."
kubectl rollout status deployment/kptest-frontend -n ${NAMESPACE} --timeout=300s

# Verify rollback
echo "Verifying rollback..."
./scripts/verify-deployment.sh production

# Run smoke tests
echo "Running smoke tests..."
npm run test:smoke -- --env=production

# Notify completion
./scripts/notify-slack.sh "✅ Rollback to ${VERSION} completed"

echo ""
echo "=== Rollback Complete ==="
echo "Please monitor dashboards and report any issues."
```

### Database Rollback

If database migrations caused issues:

```bash
#!/bin/bash
# rollback-database.sh

set -e

NAMESPACE="kptest-production"

echo "=== Database Rollback ==="
echo "WARNING: This will undo database migrations"
echo ""

# Confirm
read -p "Confirm database rollback? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Database rollback cancelled"
    exit 1
fi

# Check current migration state
echo "Current migration state:"
kubectl exec -n ${NAMESPACE} deployment/kptest-backend -- \
  java -jar /app/backend.jar --flyway.info

# Undo last migration
echo "Undoing last migration..."
kubectl exec -n ${NAMESPACE} deployment/kptest-backend -- \
  java -jar /app/backend.jar --flyway.undo

# Verify
echo "Verifying migration state..."
kubectl exec -n ${NAMESPACE} deployment/kptest-backend -- \
  java -jar /app/backend.jar --flyway.info

echo "Database rollback complete"
```

### Full System Rollback (Including Database)

```bash
#!/bin/bash
# full-rollback.sh

set -e

VERSION=${1:-"previous"}

echo "=== Full System Rollback ==="
echo "This will rollback application AND database"
echo ""

# Pre-rollback backup
echo "Creating emergency backup..."
./scripts/backup-production.sh emergency-$(date +%Y%m%d-%H%M%S)

# Rollback database first
echo "Rolling back database..."
./scripts/rollback-database.sh

# Rollback application
echo "Rolling back application..."
./scripts/rollback-production.sh ${VERSION}

# Verify
echo "Verifying system..."
./scripts/verify-deployment.sh production

echo "=== Full Rollback Complete ==="
```

## Rollback Verification

### Health Checks

```bash
# API health
curl -f https://api.kptest.com/actuator/health

# Database connectivity
curl -f https://api.kptest.com/actuator/health/db

# Full health
curl -f https://api.kptest.com/actuator/health/readiness
```

### Smoke Tests

```bash
# Run critical path tests
npm run test:smoke -- --env=production

# Key tests:
# - Login
# - Patient list
# - Message send
# - Report generation
```

### Metrics Verification

```bash
# Check error rate
curl https://api.kptest.com/actuator/prometheus | \
  grep "http_requests_total{status=~\"5..\"}"

# Check response time
curl https://api.kptest.com/actuator/prometheus | \
  grep "http_request_duration_seconds"

# Compare with pre-deployment baseline
```

## Post-Rollback Activities

### Immediate Actions

1. **Verify System Stability**
   - Monitor dashboards for 30 minutes
   - Check error rates
   - Verify user functionality

2. **Document Rollback**
   - Record rollback time
   - Note target version
   - Document reason

3. **Communicate**
   - Notify stakeholders
   - Update status page
   - Inform support team

### Post-Mortem

Within 24 hours:

1. **Schedule Post-Mortem**
   - Include all stakeholders
   - Prepare timeline
   - Gather logs and metrics

2. **Conduct Analysis**
   - What caused the issue?
   - Why wasn't it caught earlier?
   - How can we prevent recurrence?

3. **Document Findings**
   - Create incident report
   - Update runbooks
   - Implement preventive measures

### Incident Report Template

```markdown
# Rollback Incident Report

## Summary
- **Date:** YYYY-MM-DD
- **Time:** HH:MM UTC
- **Duration:** X minutes
- **Severity:** Critical/High/Medium

## Timeline
| Time | Event |
|------|-------|
| HH:MM | Deployment started |
| HH:MM | Issue detected |
| HH:MM | Rollback decision |
| HH:MM | Rollback completed |

## Root Cause
[Description]

## Impact
- Users affected: X
- Downtime: X minutes
- Data loss: None/Describe

## Lessons Learned
- What went well
- What could be improved

## Action Items
| Item | Owner | Due Date |
|------|-------|----------|
| [Action] | [Name] | [Date] |
```

## Rollback Best Practices

### Preparation

1. **Always have a rollback plan** before deploying
2. **Test rollback procedures** in staging
3. **Keep previous versions** available for quick rollback
4. **Document rollback steps** in runbooks

### Execution

1. **Act quickly** when rollback is needed
2. **Communicate clearly** throughout the process
3. **Verify thoroughly** after rollback
4. **Document everything** for post-mortem

### Prevention

1. **Improve testing** to catch issues earlier
2. **Use canary deployments** for gradual rollout
3. **Implement feature flags** for quick disabling
4. **Monitor continuously** for early detection

## Emergency Contacts

| Role | Contact |
|------|---------|
| On-call Engineer | +48-XXX-XXX-XXX |
| DevOps Lead | +48-XXX-XXX-XXX |
| CTO | +48-XXX-XXX-XXX |

---

**Last Updated:** 2026-04-24
**Version:** 1.0.0
