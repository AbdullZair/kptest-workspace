# Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying KPTEST to production using Kubernetes and GitHub Actions CI/CD.

---

## Prerequisites

### Required Access

- [ ] GitHub repository access with write permissions
- [ ] Kubernetes cluster access (kubectl configured)
- [ ] Container registry access (ghcr.io)
- [ ] AWS credentials for S3 backups
- [ ] Domain DNS access for TLS certificates

### Required Tools

```bash
# Verify installations
kubectl version --client
helm version
aws --version
gh --version  # GitHub CLI
```

### Pre-Deployment Checklist

- [ ] All tests passing in main branch
- [ ] Security scans completed
- [ ] Staging deployment verified
- [ ] Database backup completed
- [ ] Team notified of deployment
- [ ] Rollback plan documented

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Deployment Methods](#deployment-methods)
3. [Automated Deployment](#automated-deployment)
4. [Manual Deployment](#manual-deployment)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Rollback Procedures](#rollback-procedures)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Production Environment

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              kptest-production (Namespace)           │    │
│  │                                                      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │   Frontend  │  │   Backend   │  │   HIS Mock  │  │    │
│  │  │  (x2-x8)    │  │  (x3-x10)   │  │    (x1)     │  │    │
│  │  │   Nginx     │  │Spring Boot  │  │Spring Boot  │  │    │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │    │
│  │         │                │                │         │    │
│  │         └────────────────┼────────────────┘         │    │
│  │                          │                          │    │
│  │              ┌───────────┴───────────┐              │    │
│  │              │                       │              │    │
│  │        ┌─────▼─────┐           ┌─────▼─────┐       │    │
│  │        │ PostgreSQL│           │   Redis   │       │    │
│  │        │   (x1)    │           │   (x1)    │       │    │
│  │        │  15.4     │           │    7.2    │       │    │
│  │        └───────────┘           └───────────┘       │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Ingress    │  │   HPA       │  │  Network    │         │
│  │  (TLS)      │  │ (Auto-scale)│  │  Policies   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Resource Allocation

| Component | Requests | Limits | Replicas |
|-----------|----------|--------|----------|
| Backend | 250m CPU, 512Mi RAM | 1000m CPU, 1Gi RAM | 3-10 |
| Frontend | 100m CPU, 128Mi RAM | 500m CPU, 512Mi RAM | 2-8 |
| PostgreSQL | 500m CPU, 1Gi RAM | 2000m CPU, 4Gi RAM | 1 |
| Redis | 100m CPU, 256Mi RAM | 500m CPU, 1Gi RAM | 1 |

---

## Deployment Methods

### Method Comparison

| Method | Speed | Risk | Use Case |
|--------|-------|------|----------|
| Automated (GitHub Actions) | Fast | Low | Standard deployments |
| Manual (kubectl) | Medium | Medium | Emergency fixes |
| Helm | Fast | Low | Multi-environment |
| GitOps (ArgoCD) | Fast | Low | Continuous deployment |

---

## Automated Deployment

### Via GitHub Actions (Recommended)

#### Step 1: Create Release Tag

```bash
# Tag the release
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0
```

#### Step 2: Trigger Deployment

The deployment workflow triggers automatically on version tags:

```yaml
# .github/workflows/deploy-production.yml
on:
  push:
    tags:
      - 'v*.*.*'
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to deploy'
        required: false
```

#### Step 3: Monitor Deployment

```bash
# Watch workflow progress
gh run watch

# View deployment logs
gh run view --log
```

#### Step 4: Verify Deployment

```bash
# Check deployment status
kubectl get deployments -n kptest-production
kubectl get pods -n kptest-production
kubectl get services -n kptest-production
```

### Manual Trigger via GitHub UI

1. Navigate to **Actions** tab
2. Select **Deploy to Production** workflow
3. Click **Run workflow**
4. Select branch and enter version
5. Click **Run workflow**

---

## Manual Deployment

### Step 1: Build and Push Images

```bash
# Login to container registry
docker login ghcr.io -u USERNAME -p TOKEN

# Build backend
cd backend
./gradlew build
docker build -t ghcr.io/abdullzair/kptest-workspace/backend:v1.0.0 .
docker push ghcr.io/abdullzair/kptest-workspace/backend:v1.0.0

# Build frontend
cd ../frontend
npm run build
docker build -t ghcr.io/abdullzair/kptest-workspace/frontend:v1.0.0 .
docker push ghcr.io/abdullzair/kptest-workspace/frontend:v1.0.0
```

### Step 2: Apply Kubernetes Manifests

```bash
# Create namespace
kubectl apply -f devops/k8s/production/namespace.yaml

# Apply RBAC
kubectl apply -f devops/k8s/production/rbac.yaml

# Apply ConfigMaps
kubectl apply -f devops/k8s/production/backend-configmap.yaml
kubectl apply -f devops/k8s/production/frontend-configmap.yaml

# Apply Secrets (update with actual values)
kubectl apply -f devops/k8s/production/secrets-template.yaml

# Update and apply deployments
sed 's|image:.*backend:.*|image: ghcr.io/abdullzair/kptest-workspace/backend:v1.0.0|' \
  devops/k8s/production/backend-deployment.yaml | \
  kubectl apply -f -

sed 's|image:.*frontend:.*|image: ghcr.io/abdullzair/kptest-workspace/frontend:v1.0.0|' \
  devops/k8s/production/frontend-deployment.yaml | \
  kubectl apply -f -

# Apply services and other resources
kubectl apply -f devops/k8s/production/services.yaml
kubectl apply -f devops/k8s/production/backend-hpa.yaml
kubectl apply -f devops/k8s/production/frontend-hpa.yaml
kubectl apply -f devops/k8s/production/backend-pdb.yaml
kubectl apply -f devops/k8s/production/frontend-pdb.yaml
kubectl apply -f devops/k8s/production/network-policies.yaml
kubectl apply -f devops/k8s/production/ingress.yaml
kubectl apply -f devops/k8s/production/cert-issuer.yaml
```

### Step 3: Wait for Rollout

```bash
# Monitor backend rollout
kubectl rollout status deployment/kptest-backend -n kptest-production --timeout=600s

# Monitor frontend rollout
kubectl rollout status deployment/kptest-frontend -n kptest-production --timeout=600s
```

---

## Post-Deployment Verification

### Health Checks

```bash
# Backend health
curl -f https://api.kptest.example.com/actuator/health

# Frontend health
curl -f https://kptest.example.com

# API endpoints
curl -f https://api.kptest.example.com/api/v1/health
```

### Kubernetes Status

```bash
# Check all resources
kubectl get all -n kptest-production

# Check HPA status
kubectl get hpa -n kptest-production

# Check PDB status
kubectl get pdb -n kptest-production

# Check ingress
kubectl get ingress -n kptest-production

# Check certificates
kubectl get certificates -n kptest-production
```

### Application Verification

```bash
# Check backend logs
kubectl logs -f deployment/kptest-backend -n kptest-production

# Check frontend logs
kubectl logs -f deployment/kptest-frontend -n kptest-production

# Verify database connection
kubectl exec -it deployment/kptest-backend -n kptest-production -- \
  curl -s http://localhost:8080/actuator/health/db

# Verify Redis connection
kubectl exec -it deployment/kptest-backend -n kptest-production -- \
  curl -s http://localhost:8080/actuator/health/redis
```

### Monitoring Verification

```bash
# Check Prometheus targets
kubectl port-forward svc/prometheus 9090:9090 -n monitoring
# Open http://localhost:9090/targets

# Check Grafana dashboards
kubectl port-forward svc/grafana 3000:80 -n monitoring
# Open http://localhost:3000

# Check alert status
kubectl port-forward svc/alertmanager 9093:9093 -n monitoring
# Open http://localhost:9093
```

---

## Rollback Procedures

### Quick Rollback (kubectl)

```bash
# Rollback to previous version
kubectl rollout undo deployment/kptest-backend -n kptest-production
kubectl rollout undo deployment/kptest-frontend -n kptest-production

# Rollback to specific revision
kubectl rollout undo deployment/kptest-backend -n kptest-production --to-revision=2

# Monitor rollback
kubectl rollout status deployment/kptest-backend -n kptest-production
```

### Rollback via GitHub Actions

1. Navigate to **Actions** tab
2. Select **Deploy to Production** workflow
3. Click **Run workflow**
4. Enter previous version tag (e.g., v0.9.0)
5. Click **Run workflow**

### Emergency Rollback

```bash
# Scale down current deployment
kubectl scale deployment kptest-backend --replicas=0 -n kptest-production
kubectl scale deployment kptest-frontend --replicas=0 -n kptest-production

# Apply previous known-good manifests
kubectl apply -f devops/k8s/production/backend-deployment.yaml
kubectl apply -f devops/k8s/production/frontend-deployment.yaml

# Scale up
kubectl scale deployment kptest-backend --replicas=3 -n kptest-production
kubectl scale deployment kptest-frontend --replicas=2 -n kptest-production
```

---

## Troubleshooting

### Common Issues

#### Pod Not Starting

```bash
# Check pod status
kubectl get pods -n kptest-production

# Describe pod for events
kubectl describe pod <pod-name> -n kptest-production

# Check logs
kubectl logs <pod-name> -n kptest-production

# Check image pull issues
kubectl get events -n kptest-production --field-selector reason=Failed
```

#### Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints kptest-backend -n kptest-production

# Test from inside cluster
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://kptest-backend:8080/actuator/health

# Check ingress
kubectl describe ingress kptest-ingress -n kptest-production
```

#### High Memory Usage

```bash
# Check resource usage
kubectl top pods -n kptest-production

# Check HPA status
kubectl get hpa -n kptest-production

# Scale manually if needed
kubectl scale deployment kptest-backend --replicas=5 -n kptest-production
```

#### Certificate Issues

```bash
# Check certificate status
kubectl get certificates -n kptest-production

# Describe certificate for errors
kubectl describe certificate kptest-tls -n kptest-production

# Check cert-manager logs
kubectl logs -l app=cert-manager -n cert-manager
```

### Useful Commands

```bash
# Watch all resources
watch kubectl get all -n kptest-production

# Get pod restart count
kubectl get pods -n kptest-production -o custom-columns=NAME:.metadata.name,RESTARTS:.status.containerStatuses[0].restartCount

# Export current configuration
kubectl get all -n kptest-production -o yaml > current-state.yaml

# Debug connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -- sh
```

---

## Environment Variables

### Production Configuration

| Variable | Backend | Frontend |
|----------|---------|----------|
| SPRING_PROFILES_ACTIVE | prod | - |
| DB_HOST | From Secret | - |
| DB_PASSWORD | From Secret | - |
| JWT_SECRET | From Secret | - |
| VITE_API_URL | - | https://api.kptest.example.com |
| LOG_LEVEL | INFO | - |

---

## Deployment Windows

| Day | Time (UTC) | Type |
|-----|------------|------|
| Tuesday | 02:00-06:00 | Standard |
| Wednesday | 02:00-06:00 | Standard |
| Thursday | 02:00-06:00 | Standard |
| Friday | - | Frozen (no deployments) |
| Weekend | Emergency only | Critical fixes |

---

## Support

| Issue | Contact | Channel |
|-------|---------|---------|
| Deployment failure | DevOps Team | Slack #devops |
| Application error | Backend Team | Slack #backend |
| Database issue | DBA Team | Slack #database |
| Security concern | Security Team | security@kptest.example.com |

---

**Document Version**: 1.0  
**Last Updated**: 2026-04-24  
**Owner**: DevOps Team
