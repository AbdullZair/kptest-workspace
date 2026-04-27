# Blue-Green Deployment Guide

## Overview

Blue-green deployment is a release strategy that reduces downtime and risk by running two identical production environments. Only one environment is live at any time, allowing for instant rollback and zero-downtime deployments.

## Architecture

### Blue-Green Setup

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Blue-Green Architecture                                 │
│                                                                              │
│                              ┌─────────────┐                                │
│                              │   Load      │                                │
│                              │  Balancer   │                                │
│                              └──────┬──────┘                                │
│                                     │                                       │
│                          ┌──────────┴──────────┐                           │
│                          │                     │                           │
│                          ▼                     ▼                           │
│              ┌───────────────────┐ ┌───────────────────┐                   │
│              │   BLUE (Active)   │ │  GREEN (Standby)  │                   │
│              │                   │ │                   │                   │
│              │  ┌─────────────┐  │ │  ┌─────────────┐  │                   │
│              │  │  Frontend   │  │ │  │  Frontend   │  │                   │
│              │  │    x3       │  │ │  │    x3       │  │                   │
│              │  └─────────────┘  │ │  └─────────────┘  │                   │
│              │                   │ │                   │                   │
│              │  ┌─────────────┐  │ │  ┌─────────────┐  │                   │
│              │  │   Backend   │  │ │  │   Backend   │  │                   │
│              │  │    x5       │  │ │  │    x5       │  │                   │
│              │  └─────────────┘  │ │  └─────────────┘  │                   │
│              │                   │ │                   │                   │
│              │  Version: v1.2.0  │ │  Version: v1.3.0  │                   │
│              │  Status: LIVE     │ │  Status: STANDBY  │                   │
│              └───────────────────┘ └───────────────────┘                   │
│                          │                     │                           │
│                          └──────────┬──────────┘                           │
│                                     │                                       │
│                              ┌──────▼──────┐                               │
│                              │  Database   │                               │
│                              │  (Shared)   │                               │
│                              └─────────────┘                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Infrastructure

### Kubernetes Resources

```yaml
# Blue deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kptest-backend-blue
  namespace: kptest-production
spec:
  replicas: 5
  selector:
    matchLabels:
      app: kptest-backend
      track: blue
  template:
    metadata:
      labels:
        app: kptest-backend
        track: blue
    spec:
      containers:
      - name: backend
        image: ghcr.io/abdullzair/kptest-backend:v1.2.0
---
# Green deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kptest-backend-green
  namespace: kptest-production
spec:
  replicas: 5
  selector:
    matchLabels:
      app: kptest-backend
      track: green
  template:
    metadata:
      labels:
        app: kptest-backend
        track: green
    spec:
      containers:
      - name: backend
        image: ghcr.io/abdullzair/kptest-backend:v1.3.0
---
# Service (points to active environment)
apiVersion: v1
kind: Service
metadata:
  name: kptest-backend
  namespace: kptest-production
spec:
  selector:
    app: kptest-backend
    track: blue  # Changed to switch traffic
  ports:
  - port: 8080
    targetPort: 8080
```

## Deployment Process

### Step-by-Step Guide

#### Step 1: Prepare Green Environment

```bash
# Deploy green version (standby)
kubectl apply -f k8s/backend-green.yaml -n kptest-production
kubectl apply -f k8s/frontend-green.yaml -n kptest-production

# Wait for green pods to be ready
kubectl wait --for=condition=ready pod \
  -l app=kptest-backend,track=green \
  -n kptest-production --timeout=300s

kubectl wait --for=condition=ready pod \
  -l app=kptest-frontend,track=green \
  -n kptest-production --timeout=300s
```

#### Step 2: Test Green Environment

```bash
# Test green environment directly (bypass load balancer)
GREEN_BACKEND=$(kubectl get pod -l app=kptest-backend,track=green \
  -n kptest-production -o jsonpath='{.items[0].podIP}')

# Run tests against green
curl http://${GREEN_BACKEND}:8080/actuator/health
npm run test:smoke -- --target=http://${GREEN_BACKEND}:8080

# Run integration tests
npm run test:integration -- --env=green
```

#### Step 3: Switch Traffic

```bash
# Switch backend traffic to green
kubectl patch service kptest-backend -n kptest-production \
  -p '{"spec":{"selector":{"track":"green"}}}'

# Switch frontend traffic to green
kubectl patch service kptest-frontend -n kptest-production \
  -p '{"spec":{"selector":{"track":"green"}}}'

# Verify traffic switch
kubectl get service kptest-backend -n kptest-production -o jsonpath='{.spec.selector}'
```

#### Step 4: Verify Deployment

```bash
# Health checks
curl -f https://api.kptest.com/actuator/health

# Run smoke tests
npm run test:smoke -- --env=production

# Monitor metrics for 5 minutes
./scripts/monitor-deployment.sh --duration=300

# Check error rates
curl https://api.kptest.com/actuator/prometheus | \
  grep "http_requests_total{status=~\"5..\"}"
```

#### Step 5: Cleanup Blue Environment

After confirming green is stable (recommended: wait 1 hour):

```bash
# Scale down blue (keep for quick rollback)
kubectl scale deployment kptest-backend-blue --replicas=0 -n kptest-production
kubectl scale deployment kptest-frontend-blue --replicas=0 -n kptest-production

# Or delete blue entirely (after 24 hours of stability)
kubectl delete deployment kptest-backend-blue -n kptest-production
kubectl delete deployment kptest-frontend-blue -n kptest-production
```

## Automated Blue-Green Deployment

### GitHub Actions Workflow

```yaml
name: Blue-Green Deployment

on:
  push:
    branches:
      - main

jobs:
  blue-green-deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
    - uses: actions/checkout@v4
    
    - name: Determine target environment
      id: target
      run: |
        CURRENT=$(kubectl get service kptest-backend -n kptest-production \
          -o jsonpath='{.spec.selector.track}')
        if [ "$CURRENT" == "blue" ]; then
          echo "target=green" >> $GITHUB_OUTPUT
        else
          echo "target=blue" >> $GITHUB_OUTPUT
        fi
    
    - name: Deploy to standby environment
      run: |
        kubectl apply -f k8s/backend-${{ steps.target.outputs.target }}.yaml
        kubectl apply -f k8s/frontend-${{ steps.target.outputs.target }}.yaml
    
    - name: Wait for deployment
      run: |
        kubectl wait --for=condition=ready pod \
          -l app=kptest-backend,track=${{ steps.target.outputs.target }} \
          -n kptest-production --timeout=300s
    
    - name: Test standby environment
      run: |
        npm run test:smoke -- --env=${{ steps.target.outputs.target }}
    
    - name: Switch traffic
      run: |
        kubectl patch service kptest-backend -n kptest-production \
          -p '{"spec":{"selector":{"track":"${{ steps.target.outputs.target }}"}}}'
        kubectl patch service kptest-frontend -n kptest-production \
          -p '{"spec":{"selector":{"track":"${{ steps.target.outputs.target }}"}}}'
    
    - name: Verify deployment
      run: |
        curl -f https://api.kptest.com/actuator/health
        npm run test:smoke -- --env=production
    
    - name: Scale down old environment
      run: |
        if [ "${{ steps.target.outputs.target }}" == "green" ]; then
          OLD=blue
        else
          OLD=green
        fi
        kubectl scale deployment kptest-backend-${OLD} --replicas=0 -n kptest-production
        kubectl scale deployment kptest-frontend-${OLD} --replicas=0 -n kptest-production
```

## Rollback Procedure

### Instant Rollback

```bash
# Get current active environment
CURRENT=$(kubectl get service kptest-backend -n kptest-production \
  -o jsonpath='{.spec.selector.track}')

# Determine standby environment
if [ "$CURRENT" == "blue" ]; then
  STANDBY="green"
else
  STANDBY="blue"
fi

# Switch back to standby (instant rollback)
kubectl patch service kptest-backend -n kptest-production \
  -p "{\"spec\":{\"selector\":{\"track\":\"${STANDBY}\"}}}"

kubectl patch service kptest-frontend -n kptest-production \
  -p "{\"spec\":{\"selector\":{\"track\":\"${STANDBY}\"}}}"

echo "Rolled back to ${STANDBY} environment"
```

## Database Considerations

### Backward Compatible Migrations

For blue-green with shared database:

1. **Deploy in phases:**
   - Phase 1: Deploy database migration (backward compatible)
   - Phase 2: Deploy new application version
   - Phase 3: Switch traffic

2. **Migration patterns:**
   - Additive changes only (new columns, new tables)
   - Never remove columns during deployment
   - Use expand/contract pattern

### Example Migration Strategy

```sql
-- Phase 1: Add new column (backward compatible)
ALTER TABLE patients ADD COLUMN new_field VARCHAR(255);

-- Deploy application that reads/writes new_field

-- Phase 2: (Next deployment) Remove old column
-- ALTER TABLE patients DROP COLUMN old_field;
```

## Monitoring

### Key Metrics

```yaml
# Prometheus queries for blue-green monitoring
metrics:
  active_environment:
    query: kubectl get service kptest-backend -o jsonpath='{.spec.selector.track}'
  
  deployment_health:
    query: sum(rate(http_requests_total{status=~"5.."}[5m])) by (track)
  
  response_time:
    query: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) by (track)
  
  pod_readiness:
    query: kube_pod_status_ready{namespace="kptest-production"}
```

### Dashboards

Create Grafana dashboard with:
- Active environment indicator
- Error rates by environment (blue/green)
- Response times by environment
- Pod status by environment

## Best Practices

### Before Deployment

1. **Test in staging** with blue-green setup
2. **Verify database migrations** are backward compatible
3. **Prepare rollback plan**
4. **Notify stakeholders** of deployment window

### During Deployment

1. **Monitor closely** during traffic switch
2. **Keep blue running** until green is verified
3. **Have rollback ready** to execute instantly
4. **Document** any issues encountered

### After Deployment

1. **Wait for stability** before cleaning up
2. **Keep old version** available for 24 hours
3. **Document lessons learned**
4. **Update runbooks** if needed

## Cost Considerations

### Resource Usage

Blue-green requires double resources during deployment:

| Resource | Normal | During Deployment |
|----------|--------|-------------------|
| Backend Pods | 5 | 10 |
| Frontend Pods | 3 | 6 |
| Memory | 5GB | 10GB |
| CPU | 5 cores | 10 cores |

### Cost Optimization

1. **Scale down standby** after verification
2. **Use HPA** for automatic scaling
3. **Schedule deployments** during low-traffic periods
4. **Clean up old** environments promptly

---

**Last Updated:** 2026-04-24
**Version:** 1.0.0
