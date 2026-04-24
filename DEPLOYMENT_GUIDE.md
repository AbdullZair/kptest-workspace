# Deployment Guide

Kompleksowy przewodnik wdrażania systemu KPTEST.

---

## Local Development

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Java 17+
- Node.js 20+

### Quick Start

```bash
# Clone repository
git clone https://github.com/your-org/kptest-workspace.git
cd kptest-workspace

# Start all services
docker compose up -d

# Seed database with test data
./scripts/seed-all.sh

# Verify services
docker compose ps
```

### Access Points

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:8080/api | 8080 |
| API Docs (Swagger) | http://localhost:8080/swagger-ui.html | 8080 |
| HIS Mock | http://localhost:8081 | 8081 |
| PostgreSQL | localhost:5432 | 5432 |
| Redis | localhost:6379 | 6379 |

### Environment Variables

Create `.env` file in project root:

```bash
# Database
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your-secret-key-min-32-chars

# HIS Integration
HIS_BASE_URL=http://his-mock:8081
HIS_API_KEY=test-api-key

# Email (2FA)
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=noreply@kptest.com
MAIL_PASSWORD=your-app-password
```

---

## Production (Kubernetes)

### Prerequisites

- Kubernetes 1.25+
- kubectl configured
- kustomize (optional)
- Helm 3.0+ (optional)

### Namespace Setup

```bash
kubectl apply -f devops/k8s/namespace.yaml
```

### Configuration

```bash
# Create ConfigMap
kubectl apply -f devops/k8s/configmap.yaml

# Create Secrets (update values first)
kubectl apply -f devops/k8s/secrets.yaml
```

### Database

```bash
# Deploy PostgreSQL
kubectl apply -f devops/k8s/postgres-deployment.yaml

# Verify
kubectl get pods -l app=postgres -n kptest
```

### Cache

```bash
# Deploy Redis
kubectl apply -f devops/k8s/redis-deployment.yaml

# Verify
kubectl get pods -l app=redis -n kptest
```

### Backend

```bash
# Deploy Backend
kubectl apply -f devops/k8s/backend-deployment.yaml

# Verify
kubectl get pods -l app=backend -n kptest
kubectl logs -l app=backend -n kptest
```

### Frontend

```bash
# Deploy Frontend
kubectl apply -f devops/k8s/frontend-deployment.yaml

# Verify
kubectl get pods -l app=frontend -n kptest
```

### Ingress

```bash
# Deploy Ingress
kubectl apply -f devops/k8s/ingress.yaml

# Verify
kubectl get ingress -n kptest
```

### Full Deployment Script

```bash
#!/bin/bash
# deploy.sh

set -e

echo "Deploying KPTEST to Kubernetes..."

kubectl apply -f devops/k8s/namespace.yaml
kubectl apply -f devops/k8s/configmap.yaml
kubectl apply -f devops/k8s/secrets.yaml
kubectl apply -f devops/k8s/postgres-deployment.yaml
kubectl apply -f devops/k8s/redis-deployment.yaml
kubectl apply -f devops/k8s/backend-deployment.yaml
kubectl apply -f devops/k8s/frontend-deployment.yaml
kubectl apply -f devops/k8s/ingress.yaml

echo "Waiting for deployments..."
kubectl rollout status deployment/backend -n kptest
kubectl rollout status deployment/frontend -n kptest
kubectl rollout status deployment/postgres -n kptest
kubectl rollout status deployment/redis -n kptest

echo "Deployment complete!"
kubectl get all -n kptest
```

---

## GitHub Actions CI/CD

### Workflows

#### Backend CI
**File:** `.github/workflows/backend-ci.yml`

```yaml
name: Backend CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Build with Gradle
        run: ./gradlew build
      - name: Run tests
        run: ./gradlew test jacocoTestReport
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

#### Frontend CI
**File:** `.github/workflows/frontend-ci.yml`

```yaml
name: Frontend CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Run tests
        run: npm run test
```

#### Deploy
**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          kubeconfig: ${{ secrets.KUBE_CONFIG }}
      - name: Deploy
        run: |
          kubectl apply -f devops/k8s/
          kubectl rollout restart deployment/backend -n kptest
          kubectl rollout restart deployment/frontend -n kptest
```

---

## Docker Deployment

### Build Images

```bash
# Backend
docker build -t kptest/backend:latest -f devops/docker/Dockerfile.backend .

# Frontend
docker build -t kptest/frontend:latest -f devops/docker/Dockerfile.frontend .
```

### Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    image: kptest/backend:latest
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=postgres
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis

  frontend:
    image: kptest/frontend:latest
    depends_on:
      - backend

  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## Monitoring & Health Checks

### Health Endpoints

```bash
# Backend health
curl http://localhost:8080/api/actuator/health

# Database health
curl http://localhost:8080/api/actuator/health/db

# Metrics
curl http://localhost:8080/api/actuator/metrics
```

### Kubernetes Health Probes

```yaml
livenessProbe:
  httpGet:
    path: /api/actuator/health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/actuator/health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
```

---

## Rollback

### Kubernetes Rollback

```bash
# Rollback to previous revision
kubectl rollout undo deployment/backend -n kptest

# Rollback to specific revision
kubectl rollout undo deployment/backend -n kptest --to-revision=2
```

### Docker Compose Rollback

```bash
# Pull previous version
docker pull kptest/backend:v1.0.0

# Restart with previous version
docker compose up -d
```

---

## Troubleshooting

### Common Issues

**Pod not starting:**
```bash
kubectl describe pod <pod-name> -n kptest
kubectl logs <pod-name> -n kptest
```

**Database connection failed:**
```bash
kubectl exec -it <postgres-pod> -n kptest -- psql -U kptest
```

**Service not accessible:**
```bash
kubectl get svc -n kptest
kubectl get ingress -n kptest
```

---

**Last Updated:** 2026-04-24
