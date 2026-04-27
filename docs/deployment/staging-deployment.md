# Staging Deployment Guide

## Overview

This guide describes the staging environment deployment process for KPTEST. The staging environment mirrors production for testing and validation before production releases.

## Environment Overview

### Staging vs Production

| Aspect | Staging | Production |
|--------|---------|------------|
| Purpose | Testing, validation | Live users |
| Data | Synthetic/masked | Real user data |
| Scale | Reduced | Full scale |
| Access | Team only | Public |
| Updates | Frequent | Controlled |

### Infrastructure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Staging Environment                                     │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Kubernetes Cluster (Staging)                      │    │
│  │                                                                      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │    │
│  │  │  Frontend   │  │   Backend   │  │  HIS Mock   │                 │    │
│  │  │  x1 pod     │  │   x2 pods   │  │   x1 pod    │                 │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │    │
│  │                                                                      │    │
│  │  ┌─────────────┐  ┌─────────────┐                                  │    │
│  │  │ PostgreSQL  │  │    Redis    │                                  │    │
│  │  │  (Single)   │  │   (Single)  │                                  │    │
│  │  └─────────────┘  └─────────────┘                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  URLs:                                                                       │
│  • Frontend: https://staging-app.kptest.com                                 │
│  • API: https://staging-api.kptest.com                                      │
│  • Admin: https://staging-admin.kptest.com                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

### Access Requirements

- Kubernetes cluster access (staging)
- GitHub Actions access
- Docker registry access
- AWS credentials (for S3, RDS)

### Tools Required

```bash
# Install required tools
brew install kubectl
brew install helm
brew install awscli
npm install -g @expo/cli
```

### Configuration Files

Ensure you have:
- `kubeconfig` for staging cluster
- `.env.staging` file
- AWS credentials configured

## Deployment Process

### Automated Deployment (CI/CD)

Staging deployments are triggered automatically:

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches:
      - develop

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure kubectl
      uses: azure/k8s-set-context@v3
      with:
        kubeconfig: ${{ secrets.KUBE_CONFIG_STAGING }}
    
    - name: Deploy Backend
      run: |
        kubectl set image deployment/kptest-backend \
          backend=ghcr.io/abdullzair/kptest-backend:${{ github.sha }} \
          -n kptest-staging
    
    - name: Deploy Frontend
      run: |
        kubectl set image deployment/kptest-frontend \
          frontend=ghcr.io/abdullzair/kptest-frontend:${{ github.sha }} \
          -n kptest-staging
    
    - name: Wait for Rollout
      run: |
        kubectl rollout status deployment/kptest-backend -n kptest-staging
        kubectl rollout status deployment/kptest-frontend -n kptest-staging
    
    - name: Run Smoke Tests
      run: |
        npm run test:smoke -- --env=staging
```

### Manual Deployment

#### Step 1: Build and Push Images

```bash
# Backend
cd backend
./gradlew build
docker build -t ghcr.io/abdullzair/kptest-backend:staging-$(date +%Y%m%d-%H%M%S) .
docker push ghcr.io/abdullzair/kptest-backend:staging-$(date +%Y%m%d-%H%M%S)

# Frontend
cd frontend
npm run build
docker build -t ghcr.io/abdullzair/kptest-frontend:staging-$(date +%Y%m%d-%H%M%S) .
docker push ghcr.io/abdullzair/kptest-frontend:staging-$(date +%Y%m%d-%H%M%S)
```

#### Step 2: Update Deployment

```bash
# Set context to staging
kubectl config use-context staging

# Update backend image
kubectl set image deployment/kptest-backend \
  backend=ghcr.io/abdullzair/kptest-backend:staging-$(date +%Y%m%d-%H%M%S) \
  -n kptest-staging

# Update frontend image
kubectl set image deployment/kptest-frontend \
  frontend=ghcr.io/abdullzair/kptest-frontend:staging-$(date +%Y%m%d-%H%M%S) \
  -n kptest-staging
```

#### Step 3: Monitor Rollout

```bash
# Watch rollout status
kubectl rollout status deployment/kptest-backend -n kptest-staging
kubectl rollout status deployment/kptest-frontend -n kptest-staging

# Check pod status
kubectl get pods -n kptest-staging
```

#### Step 4: Verify Deployment

```bash
# Check application logs
kubectl logs -l app=kptest-backend -n kptest-staging --tail=50

# Run health check
curl https://staging-api.kptest.com/actuator/health

# Run smoke tests
npm run test:smoke -- --env=staging
```

## Database Management

### Seeding Test Data

```bash
# Run database seed script
kubectl exec -n kptest-staging deployment/kptest-backend -- \
  java -jar /app/backend.jar --spring.profiles.active=staging --seed-data=true
```

### Database Migration

```bash
# Run Flyway migrations
kubectl exec -n kptest-staging deployment/kptest-backend -- \
  java -jar /app/backend.jar --flyway.migrate
```

### Reset Staging Database

```bash
# WARNING: This deletes all staging data!

# Get backup first
./scripts/backup-staging.sh

# Drop and recreate
kubectl exec -n kptest-staging deployment/kptest-postgresql -- \
  dropdb -U kptest_user kptest

kubectl exec -n kptest-staging deployment/kptest-postgresql -- \
  createdb -U kptest_user kptest

# Run migrations
kubectl exec -n kptest-staging deployment/kptest-backend -- \
  java -jar /app/backend.jar --flyway.migrate

# Seed data
kubectl exec -n kptest-staging deployment/kptest-backend -- \
  java -jar /app/backend.jar --seed-data=true
```

## Testing

### Smoke Tests

```bash
# Run smoke tests
cd tests
npm install
npm run test:smoke -- --env=staging
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration -- --env=staging
```

### Performance Tests

```bash
# Run load tests
npm run test:load -- --env=staging --users=50
```

## Configuration

### Environment Variables

```yaml
# Staging configuration
staging:
  replicas:
    backend: 2
    frontend: 1
  resources:
    backend:
      requests:
        memory: "256Mi"
        cpu: "100m"
      limits:
        memory: "512Mi"
        cpu: "500m"
  database:
    host: kptest-postgresql-staging
    name: kptest_staging
  features:
    his_integration: false
    sms_notifications: false
    email_notifications: true
```

### Feature Flags

Staging can have different feature flags:

```yaml
features:
  new_dashboard: true
  beta_reports: true
  experimental_api: true
```

## Monitoring

### Staging Dashboards

- Grafana: https://staging-grafana.kptest.com
- Logs: https://staging-kibana.kptest.com

### Alerts

Staging has reduced alerting:
- Critical errors only
- No paging (Slack notifications)
- Daily summary report

## Troubleshooting

### Common Issues

**Pods not starting:**
```bash
# Check events
kubectl get events -n kptest-staging --sort-by='.lastTimestamp'

# Check pod logs
kubectl logs <pod-name> -n kptest-staging
```

**Database connection failed:**
```bash
# Check database pod
kubectl get pods -n kptest-staging -l app=postgresql

# Test connection
kubectl exec -n kptest-staging deployment/kptest-backend -- \
  pg_isready -h kptest-postgresql-staging
```

**Image pull errors:**
```bash
# Check image exists
docker pull ghcr.io/abdullzair/kptest-backend:staging-latest

# Check credentials
kubectl get secret ghcr-credentials -n kptest-staging
```

## Cleanup

### Remove Old Deployments

```bash
# List old replicasets
kubectl get rs -n kptest-staging

# Delete old replicasets
kubectl delete rs <old-replicaset> -n kptest-staging
```

### Resource Cleanup

```bash
# Delete unused images from registry
# (Manual via GitHub Container Registry UI)

# Clean up old backups
aws s3 rm s3://kptest-staging-backups/ --recursive --exclude "*" --include "*-old/*"
```

---

**Last Updated:** 2026-04-24
**Version:** 1.0.0
