# KPTEST DevOps

Infrastructure, CI/CD, and deployment configurations for KPTEST.

## 📊 Status

| Metryka | Wartość |
|---------|---------|
| Status | ✅ 100% |
| Docker Images | 5 |
| K8s Manifests | 10+ |
| CI/CD Workflows | 5 |
| Scripts | 10+ |

## 📁 Struktura

```
devops/
├── docker/
│   ├── backend/
│   │   └── Dockerfile
│   ├── frontend/
│   │   └── Dockerfile
│   ├── mobile/
│   │   └── Dockerfile
│   └── his-mock/
│       └── Dockerfile
├── k8s/
│   ├── namespace.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── postgres-deployment.yaml
│   ├── postgres-pvc.yaml
│   ├── redis-deployment.yaml
│   ├── redis-service.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── ingress.yaml
│   └── hpa.yaml
├── github/
│   └── workflows/
│       ├── backend-ci.yml
│       ├── frontend-ci.yml
│       ├── mobile-ci.yml
│       ├── e2e-tests.yml
│       └── deploy.yml
├── prometheus/
│   └── prometheus.yml
├── grafana/
│   └── dashboards/
│       └── kptest-dashboard.json
└── README.md
```

## 🐳 Docker

### Images

| Image | Base | Size | Opis |
|-------|------|------|------|
| kptest-backend | eclipse-temurin:21-jre | ~200MB | Spring Boot API |
| kptest-frontend | node:20-alpine | ~150MB | React App |
| kptest-mobile | node:20-alpine | ~150MB | Expo App |
| kptest-his-mock | eclipse-temurin:21-jre | ~200MB | HIS Mock |
| postgres | postgres:15 | ~400MB | Database |
| redis | redis:7-alpine | ~50MB | Cache |

### Backend Dockerfile

```dockerfile
# devops/docker/backend/Dockerfile
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY backend/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Frontend Dockerfile

```dockerfile
# devops/docker/frontend/Dockerfile
FROM node:20-alpine as builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY devops/docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

### Build Images

```bash
# Backend
docker build -t kptest-backend -f devops/docker/backend/Dockerfile .

# Frontend
docker build -t kptest-frontend -f devops/docker/frontend/Dockerfile .

# Mobile
docker build -t kptest-mobile -f devops/docker/mobile/Dockerfile .

# All
docker compose build
```

## ☸️ Kubernetes

### Namespace

```yaml
# devops/k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: kptest
  labels:
    name: kptest
```

### Backend Deployment

```yaml
# devops/k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kptest-backend
  namespace: kptest
spec:
  replicas: 3
  selector:
    matchLabels:
      app: kptest-backend
  template:
    metadata:
      labels:
        app: kptest-backend
    spec:
      containers:
        - name: backend
          image: kptest-backend:latest
          ports:
            - containerPort: 8080
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: "prod"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: kptest-secrets
                  key: database-url
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 60
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 5
```

### Services

```yaml
# devops/k8s/backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: kptest-backend
  namespace: kptest
spec:
  selector:
    app: kptest-backend
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
  type: ClusterIP

# devops/k8s/frontend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: kptest-frontend
  namespace: kptest
spec:
  selector:
    app: kptest-frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
```

### Ingress

```yaml
# devops/k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: kptest-ingress
  namespace: kptest
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - kptest.example.com
      secretName: kptest-tls
  rules:
    - host: kptest.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: kptest-backend
                port:
                  number: 8080
          - path: /
            pathType: Prefix
            backend:
              service:
                name: kptest-frontend
                port:
                  number: 80
```

### Deploy to K8s

```bash
# Create namespace
kubectl apply -f devops/k8s/namespace.yaml

# Apply all manifests
kubectl apply -f devops/k8s/

# Check status
kubectl get all -n kptest

# Scale backend
kubectl scale deployment kptest-backend --replicas=5 -n kptest

# View logs
kubectl logs -f deployment/kptest-backend -n kptest
```

## 🔁 CI/CD

### Workflows

| Workflow | Trigger | Opis |
|----------|---------|------|
| backend-ci.yml | push/PR to backend/ | Build, test, lint backend |
| frontend-ci.yml | push/PR to frontend/ | Build, test, lint frontend |
| mobile-ci.yml | push/PR to mobile/ | Build, test, lint mobile |
| e2e-tests.yml | PR to main/ | Run E2E tests |
| deploy.yml | push to main | Deploy to production |

### Backend CI

```yaml
# .github/workflows/backend-ci.yml
name: Backend CI

on:
  push:
    paths:
      - 'backend/**'
  pull_request:
    paths:
      - 'backend/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Java 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      - name: Build with Gradle
        run: cd backend && ./gradlew build
      - name: Run tests
        run: cd backend && ./gradlew test
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Deploy Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and push images
        run: |
          docker build -t kptest-backend -f devops/docker/backend/Dockerfile .
          docker push kptest-backend:latest
      - name: Deploy to K8s
        run: |
          kubectl apply -f devops/k8s/
          kubectl rollout restart deployment kptest-backend -n kptest
```

## 📊 Monitoring

### Prometheus

```yaml
# devops/prometheus/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'kptest-backend'
    static_configs:
      - targets: ['kptest-backend:8080']
    metrics_path: '/actuator/prometheus'
```

### Grafana Dashboards

| Dashboard | Opis |
|-----------|------|
| System Overview | CPU, Memory, Disk, Network |
| API Performance | Response times, throughput, errors |
| Database | Connections, queries, locks |
| JVM | Heap, GC, threads |
| Business Metrics | Users, patients, projects |

## 📜 Scripts

| Script | Opis |
|--------|------|
| `scripts/init_project.sh` | Initialize project |
| `scripts/start.sh` | Quick start |
| `scripts/build_all.sh` | Build all components |
| `scripts/deploy.sh` | Deploy to K8s |
| `scripts/backup.sh` | Database backup |
| `scripts/restore.sh` | Database restore |
| `scripts/health_check.sh` | Health check |
| `scripts/cleanup.sh` | Cleanup resources |
| `scripts/generate_docs.sh` | Generate docs |
| `scripts/run_tests.sh` | Run all tests |

## 🔧 Troubleshooting

### Pod not starting

```bash
# Check pod status
kubectl get pods -n kptest

# Describe pod
kubectl describe pod <pod-name> -n kptest

# View logs
kubectl logs <pod-name> -n kptest
```

### Service not accessible

```bash
# Check service
kubectl get svc -n kptest

# Check endpoints
kubectl get endpoints -n kptest

# Test from inside cluster
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://kptest-backend:8080/actuator/health
```

### High memory usage

```bash
# Check resource usage
kubectl top pods -n kptest

# Scale down
kubectl scale deployment kptest-backend --replicas=1 -n kptest

# Check HPA
kubectl get hpa -n kptest
```

## 📄 Licencja

Własnościowe - wszystkie prawa zastrzeżone.

---

**KPTEST Team** © 2026
