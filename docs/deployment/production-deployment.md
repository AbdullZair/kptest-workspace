# Production Deployment Guide

## Overview

This guide describes the production deployment process for KPTEST, including pre-deployment checks, deployment procedures, and post-deployment verification.

## Environment Overview

### Production Infrastructure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Production Environment                                   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                  Kubernetes Cluster (Production)                      │    │
│  │                                                                      │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │                   Application Layer                          │    │    │
│  │  │                                                               │    │    │
│  │  │  ┌───────────┐  ┌───────────┐  ┌───────────┐                │    │    │
│  │  │  │ Frontend  │  │  Backend  │  │   HIS     │                │    │    │
│  │  │  │   x3      │  │   x5      │  │  (ext)    │                │    │    │
│  │  │  └───────────┘  └───────────┘  └───────────┘                │    │    │
│  │  │                                                               │    │    │
│  │  │  Load Balancer: AWS ALB                                       │    │    │
│  │  │  Ingress: nginx-ingress-controller                            │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  │                                                                      │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │                     Data Layer                               │    │    │
│  │  │                                                               │    │    │
│  │  │  ┌───────────┐  ┌───────────┐  ┌───────────┐                │    │    │
│  │  │  │ PostgreSQL│  │   Redis   │  │    S3     │                │    │    │
│  │  │  │  Multi-AZ │  │  Cluster  │  │  Storage  │                │    │    │
│  │  │  └───────────┘  └───────────┘  └───────────┘                │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  URLs:                                                                       │
│  • Frontend: https://app.kptest.com                                         │
│  • API: https://api.kptest.com                                              │
│  • Admin: https://admin.kptest.com                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage >= 80%
- [ ] Static analysis passed (SonarQube)
- [ ] Security scan passed (Snyk/Dependabot)
- [ ] Performance tests passed

### Documentation

- [ ] CHANGELOG.md updated
- [ ] API documentation updated
- [ ] Migration scripts reviewed
- [ ] Rollback plan documented

### Staging Validation

- [ ] Deployed to staging successfully
- [ ] Smoke tests passed in staging
- [ ] Performance validated in staging
- [ ] Stakeholder sign-off obtained

### Infrastructure

- [ ] Backup completed successfully
- [ ] Disk space adequate (>20% free)
- [ ] SSL certificates valid (>30 days)
- [ ] Monitoring dashboards ready

## Deployment Process

### Automated Deployment (Recommended)

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches:
      - main
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to deploy'
        required: true

jobs:
  deploy-production:
    runs-on: ubuntu-latest
    environment: production
    steps:
    - uses: actions/checkout@v4
    
    - name: Pre-deployment checks
      run: |
        # Verify tests passed
        npm run test:all
        # Verify coverage
        npm run coverage:check
    
    - name: Create backup
      run: |
        ./scripts/backup-production.sh
    
    - name: Configure kubectl
      uses: azure/k8s-set-context@v3
      with:
        kubeconfig: ${{ secrets.KUBE_CONFIG_PRODUCTION }}
    
    - name: Deploy Backend (Rolling Update)
      run: |
        kubectl set image deployment/kptest-backend \
          backend=ghcr.io/abdullzair/kptest-backend:${{ github.sha }} \
          -n kptest-production
        kubectl rollout status deployment/kptest-backend -n kptest-production
    
    - name: Deploy Frontend (Rolling Update)
      run: |
        kubectl set image deployment/kptest-frontend \
          frontend=ghcr.io/abdullzair/kptest-frontend:${{ github.sha }} \
          -n kptest-production
        kubectl rollout status deployment/kptest-frontend -n kptest-production
    
    - name: Run Database Migrations
      run: |
        kubectl exec -n kptest-production deployment/kptest-backend -- \
          java -jar /app/backend.jar --flyway.migrate
    
    - name: Post-deployment verification
      run: |
        # Health checks
        curl -f https://api.kptest.com/actuator/health
        curl -f https://app.kptest.com
        
        # Run smoke tests
        npm run test:smoke -- --env=production
    
    - name: Notify stakeholders
      if: always()
      run: |
        ./scripts/notify-deployment.sh ${{ job.status }}
```

### Manual Deployment

#### Step 1: Pre-Deployment Backup

```bash
# Create database backup
./scripts/backup-production.sh

# Verify backup
./scripts/verify-backup.sh /backup/production/latest.dump

# Export current configuration
kubectl get configmap,secret,deployment -n kptest-production -o yaml > deployment-backup-$(date +%Y%m%d).yaml
```

#### Step 2: Put System in Maintenance Mode (Optional)

For major deployments:

```bash
# Enable maintenance mode
kubectl patch configmap kptest-config -n kptest-production \
  --type=json -p='[{"op": "replace", "path": "/data/maintenance-mode", "value": "true"}]'

# Update maintenance message
kubectl patch configmap kptest-config -n kptest-production \
  --type=json -p='[{"op": "replace", "path": "/data/maintenance-message", "value": "System maintenance in progress. Expected downtime: 15 minutes."}]'
```

#### Step 3: Deploy Backend

```bash
# Set context
kubectl config use-context production

# Update deployment
kubectl set image deployment/kptest-backend \
  backend=ghcr.io/abdullzair/kptest-backend:v1.2.0 \
  -n kptest-production

# Monitor rollout
kubectl rollout status deployment/kptest-backend -n kptest-production --timeout=300s

# Verify pods
kubectl get pods -n kptest-production -l app=kptest-backend
```

#### Step 4: Deploy Frontend

```bash
# Update deployment
kubectl set image deployment/kptest-frontend \
  frontend=ghcr.io/abdullzair/kptest-frontend:v1.2.0 \
  -n kptest-production

# Monitor rollout
kubectl rollout status deployment/kptest-frontend -n kptest-production --timeout=300s
```

#### Step 5: Run Migrations

```bash
# Run Flyway migrations
kubectl exec -n kptest-production deployment/kptest-backend -- \
  java -jar /app/backend.jar --flyway.migrate

# Verify migrations
kubectl exec -n kptest-production deployment/kptest-backend -- \
  java -jar /app/backend.jar --flyway.info
```

#### Step 6: Post-Deployment Verification

```bash
# Health checks
curl -f https://api.kptest.com/actuator/health
curl -f https://api.kptest.com/actuator/health/readiness
curl -f https://app.kptest.com

# Run smoke tests
npm run test:smoke -- --env=production

# Check logs for errors
kubectl logs -l app=kptest-backend -n kptest-production --tail=100 | grep -i error

# Verify metrics
curl https://api.kptest.com/actuator/prometheus | grep -E "http_requests_total|jvm_memory"
```

#### Step 7: Disable Maintenance Mode

```bash
kubectl patch configmap kptest-config -n kptest-production \
  --type=json -p='[{"op": "replace", "path": "/data/maintenance-mode", "value": "false"}]'
```

## Deployment Strategies

### Rolling Update (Default)

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

**Pros:** Zero downtime, simple
**Cons:** Slower deployment

### Blue-Green Deployment

For zero-risk deployments:

```bash
# Deploy green (new version)
kubectl apply -f k8s/backend-green.yaml

# Test green deployment
./scripts/test-green.sh

# Switch traffic
kubectl patch service kptest-backend -n kptest-production \
  -p '{"spec":{"selector":{"track":"green"}}}'

# Monitor
./scripts/monitor-deployment.sh

# Keep blue for rollback, cleanup later
```

### Canary Deployment

For gradual rollout:

```bash
# Deploy canary (10% traffic)
kubectl apply -f k8s/backend-canary.yaml

# Monitor metrics
./scripts/monitor-canary.sh

# If healthy, increase to 50%
kubectl scale deployment kptest-backend-canary --replicas=3 -n kptest-production

# If still healthy, full rollout
kubectl scale deployment kptest-backend-canary --replicas=5 -n kptest-production
kubectl delete deployment kptest-backend-blue -n kptest-production
```

## Database Migrations

### Pre-Migration Checklist

- [ ] Backup created
- [ ] Migration script tested in staging
- [ ] Rollback script prepared
- [ ] Downtime estimated and communicated

### Running Migrations

```bash
# Automatic (part of deployment)
kubectl exec -n kptest-production deployment/kptest-backend -- \
  java -jar /app/backend.jar --flyway.migrate

# Manual (if needed)
kubectl exec -n kptest-production deployment/kptest-backend -- \
  java -jar /app/backend.jar --flyway.migrate -X
```

### Migration Rollback

```bash
# Rollback one version
kubectl exec -n kptest-production deployment/kptest-backend -- \
  java -jar /app/backend.jar --flyway.undo

# Rollback to specific version
kubectl exec -n kptest-production deployment/kptest-backend -- \
  java -jar /app/backend.jar --flyway.repair
```

## Post-Deployment

### Verification Checklist

- [ ] Health checks passing
- [ ] Smoke tests passing
- [ ] No error spikes in logs
- [ ] Metrics normal
- [ ] User-reported issues: none

### Monitoring

Watch these dashboards for 1 hour post-deployment:

- **Application:** https://grafana.kptest.com/d/app-overview
- **Database:** https://grafana.kptest.com/d/db-overview
- **Errors:** https://grafana.kptest.com/d/error-tracking

### Communication

```markdown
Deployment Complete

Version: v1.2.0
Time: 2026-04-24 14:30 UTC
Status: ✅ Successful

Changes:
- Feature X implemented
- Bug Y fixed
- Performance improvements

Monitoring for 1 hour. Report issues to #support.
```

## Troubleshooting

### Deployment Failed

```bash
# Check rollout status
kubectl rollout status deployment/kptest-backend -n kptest-production

# View events
kubectl get events -n kptest-production --sort-by='.lastTimestamp'

# Check pod logs
kubectl logs -l app=kptest-backend -n kptest-production --tail=200
```

### Rollback Required

```bash
# Rollback deployment
kubectl rollout undo deployment/kptest-backend -n kptest-production

# Rollback to specific revision
kubectl rollout undo deployment/kptest-backend -n kptest-production --to-revision=2

# Verify rollback
kubectl rollout status deployment/kptest-backend -n kptest-production
```

### Database Issues

```bash
# Check migration status
kubectl exec -n kptest-production deployment/kptest-backend -- \
  java -jar /app/backend.jar --flyway.info

# Restore from backup if needed
./scripts/restore-production.sh /backup/production/latest.dump
```

---

**Last Updated:** 2026-04-24
**Version:** 1.0.0
