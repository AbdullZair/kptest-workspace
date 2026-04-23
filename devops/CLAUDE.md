# CLAUDE.md - Reguły projektu DevOps

## 🏗️ ARCHITEKTURA

### Struktura folderów (ściśle przestrzegana)
```
devops/
├── docker/
│   ├── backend/
│   │   └── Dockerfile
│   ├── frontend/
│   │   └── Dockerfile
│   └── mobile/
│       └── Dockerfile (build only)
├── docker-compose/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── docker-compose.prod.yml
├── kubernetes/
│   ├── namespace.yaml
│   ├── deployments/
│   ├── services/
│   ├── configmaps/
│   └── secrets/
├── scripts/
│   ├── build.sh
│   ├── deploy.sh
│   └── cleanup.sh
└── ci-cd/
    ├── .github/workflows/
    │   ├── backend-ci.yml
    │   ├── frontend-ci.yml
    │   ├── mobile-ci.yml
    │   └── deploy.yml
    └── gitlab-ci.yml (opcjonalnie)
```

## 📏 ZASADY SOLID

### S - Single Responsibility
- Każdy Dockerfile buduje JEDEN obraz
- Każdy workflow CI/CD robi JEDNĄ rzecz (build/test/deploy)
- Skrypty mają jedną odpowiedzialność
- Separacja środowisk (dev/staging/prod) przez różne pliki

### O - Open/Closed
- Konfiguracje rozszerzalne przez environment variables
- Nowe środowiska dodawane przez nowe pliki, nie modyfikację istniejących
- Pipeline'y otwarte na nowe stage przez konfigurację

### L - Liskov Substitution
- Obrazy Docker wymienne między środowiskami (ten sam image, różne configi)
- Kontenery z różnymi tagami wersji muszą być kompatybilne wstecz

### I - Interface Segregation
- Małe, wyspecjalizowane skrypty
- Nie twórz "god scripts" z wieloma funkcjami
- Oddzielne skrypty dla build, test, deploy

### D - Dependency Inversion
- Skrypty zależą od environment variables, nie hardkodowanych wartości
- Infrastructure as Code (IaC) - Terraform/Helm
- Abstrakcja przez docker-compose dla lokalnego developmentu

## 🧹 KISS - Keep It Simple

- Maksymalnie 50 linii na Dockerfile (bez multi-stage)
- Maksymalnie 3 warstwy w multi-stage build
- Maksymalnie 10 kroków w pipeline CI/CD
- Nie stosuj overengineeringu - prosty docker-compose zamiast Kubernetes dla małych projektów
- Preferuj gotowe obrazy bazowe nad custom builds
- Unikaj skomplikowanych skryptów bash - użyj Makefile

## 🔄 DRY - Don't Repeat Yourself

- Każda konfiguracja istnieje w JEDNYM miejscu
- Wspólne zmienne -> .env files
- Powtarzające się kroki CI/CD -> reusable workflows/actions
- Multi-stage builds dla wspólnych kroków
- Helm charts dla powtarzających się deploymentów

## 📐 KONWENCJE

### Nazewnictwo
```yaml
# Obrazy Docker - lowercase z myślnikami
kptest-backend:latest
kptest-frontend:1.0.0
kptest-mobile:1.0.0-alpha

# Kontenery - nazwa-serwis-środowisko
kptest-backend-dev
kptest-backend-prod

# Volumeny - nazwa-serwis-data
kptest-postgres-data
kptest-redis-data

# Sieci - nazwa-serwis-network
kptest-internal-network

# Pliki - kebab-case
docker-compose.yml
docker-compose.dev.yml
backend.Dockerfile
```

### Wersjonowanie
```yaml
# Semantic Versioning (SemVer)
v1.0.0          # Production release
v1.0.0-beta.1   # Beta release
v1.0.0-rc.1     # Release candidate
latest          # Ostatni stable (tylko dev)
```

## 🐳 DOCKER BEST PRACTICES

### Dockerfile - Backend (Java/Spring Boot)
```dockerfile
# Multi-stage build
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY mvnw pom.xml ./
COPY src ./src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Dockerfile - Frontend (React)
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ../backend
      dockerfile: ../devops/docker/backend/Dockerfile
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=${PROFILE:-dev}
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=kptest
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - kptest-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ../frontend
      dockerfile: ../devops/docker/frontend/Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - kptest-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=kptest
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - kptest-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres-data:

networks:
  kptest-network:
    driver: bridge
```

### .dockerignore
```
# Backend
target/
!.mvn/wrapper/maven-wrapper.jar
mvnw
mvnw.cmd
src/test/
*.md
.gitignore

# Frontend
node_modules/
build/
dist/
*.log
.env.local

# General
.git/
.idea/
.vscode/
*.swp
*.swo
.DS_Store
```

## 🔧 CI/CD - GITHUB ACTIONS

### Backend CI
```yaml
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
      
      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven
      
      - name: Build and Test
        run: |
          cd backend
          ./mvnw clean verify
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          directory: backend/target/site/jacoco
      
      - name: Build Docker image
        run: |
          docker build -f devops/docker/backend/Dockerfile \
            -t kptest-backend:${{ github.sha }} \
            -t kptest-backend:latest \
            .
      
      - name: Push to registry
        if: github.ref == 'refs/heads/main'
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker push kptest-backend:${{ github.sha }}
          docker push kptest-backend:latest
```

### Frontend CI
```yaml
name: Frontend CI

on:
  push:
    paths:
      - 'frontend/**'
  pull_request:
    paths:
      - 'frontend/**'

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Lint
        run: |
          cd frontend
          npm run lint
      
      - name: Test
        run: |
          cd frontend
          npm test -- --coverage
      
      - name: Build
        run: |
          cd frontend
          npm run build
      
      - name: Build Docker image
        run: |
          docker build -f devops/docker/frontend/Dockerfile \
            -t kptest-frontend:${{ github.sha }} \
            -t kptest-frontend:latest \
            .
      
      - name: Push to registry
        if: github.ref == 'refs/heads/main'
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker push kptest-frontend:${{ github.sha }}
          docker push kptest-frontend:latest
```

### Deploy Workflow
```yaml
name: Deploy

on:
  push:
    branches:
      - main
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Kubernetes
        run: |
          kubectl apply -f devops/kubernetes/namespace.yaml
          kubectl set image deployment/backend backend=kptest-backend:${{ github.sha }}
          kubectl set image deployment/frontend frontend=kptest-frontend:${{ github.sha }}
          kubectl rollout status deployment/backend
          kubectl rollout status deployment/frontend
      
      - name: Health check
        run: |
          curl -f https://api.kptest.com/api/v1/health
          curl -f https://kptest.com
```

## ☸️ KUBERNETES

### Deployment - Backend
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: kptest
  labels:
    app: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: kptest-backend:latest
          ports:
            - containerPort: 8080
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: "prod"
            - name: DB_HOST
              valueFrom:
                configMapKeyRef:
                  name: backend-config
                  key: db-host
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: backend-secrets
                  key: db-password
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /api/v1/health
              port: 8080
            initialDelaySeconds: 60
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/v1/health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 5
```

### Service - Backend
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: kptest
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: ClusterIP
```

### ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
  namespace: kptest
data:
  db-host: "postgres-service"
  db-port: "5432"
  db-name: "kptest"
  log-level: "INFO"
```

### Secret (przykład - nigdy nie commitować prawdziwych sekretów!)
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
  namespace: kptest
type: Opaque
stringData:
  db-password: "${DB_PASSWORD}"
  jwt-secret: "${JWT_SECRET}"
```

## 📝 SKRYPTY

### build.sh
```bash
#!/bin/bash
set -euo pipefail

echo "Building all services..."

# Build backend
cd backend
./mvnw clean package -DskipTests
cd ..

# Build frontend
cd frontend
npm ci
npm run build
cd ..

# Build Docker images
docker-compose build

echo "Build completed successfully!"
```

### deploy.sh
```bash
#!/bin/bash
set -euo pipefail

ENVIRONMENT=${1:-dev}
VERSION=${2:-latest}

echo "Deploying version ${VERSION} to ${ENVIRONMENT}..."

# Tag images
docker tag kptest-backend:latest kptest-backend:${VERSION}
docker tag kptest-frontend:latest kptest-frontend:${VERSION}

# Push to registry
docker push kptest-backend:${VERSION}
docker push kptest-frontend:${VERSION}

# Deploy to Kubernetes
kubectl set image deployment/backend backend=kptest-backend:${VERSION}
kubectl set image deployment/frontend frontend=kptest-frontend:${VERSION}

# Wait for rollout
kubectl rollout status deployment/backend
kubectl rollout status deployment/frontend

echo "Deployment completed successfully!"
```

## 🚫 ZAKAZANE PRAKTYKI

- NIGDY hardcoded credentials w Dockerfile/configuracji
- NIGDY root user w kontenerach (używaj non-root)
- NIGDY latest tag w production (używaj konkretnych wersji)
- NIGDY brak health checks
- NIGDY brak resource limits
- NIGDY mountowanie całego folderu projektu do kontenera
- NIGDY uruchamianie wielu procesów w jednym kontenerze
- NIGDY ignorowanie security updates w base images
- NIGDY brak .dockerignore
- NIGDY duże obrazy (>500MB bez potrzeby)
- NIGDY deprecated API versions w Kubernetes
- NIGDY Secrets w repozytorium (używaj external secrets manager)
- NIGDY manualne zmiany w production (wszystko przez CI/CD)
- NIGDY brak rollback strategy

## ✅ WYMAGANE PRAKTYKI

- ZAWSZE multi-stage builds dla mniejszych obrazów
- ZAWSZE non-root user w kontenerach
- ZAWSZE health checks i readiness probes
- ZAWSZE resource limits (CPU/memory)
- ZAWSZE konkretne wersje base images (nie latest)
- ZAWSZE .dockerignore dla wszystkich Dockerfile
- ZAWSZE scanning obrazów pod kątem podatności (Trivy/Snyk)
- ZAWSZE logging do stdout/stderr
- ZAWSZE graceful shutdown (SIGTERM handling)
- ZAWSZE environment variables dla konfiguracji
- ZAWSZE separacja environments (dev/staging/prod)
- ZAWSZE version control dla infrastructure code
- ZAWSZE backup strategy dla baz danych
- ZAWSZE monitoring i alerting (Prometheus/Grafana)
- ZAWSZE centralne logowanie (ELK/Loki)
- ZAWSZE network policies w Kubernetes
- ZAWSZE Pod Security Standards
- ZAWSZE autoscaling (HPA/VPA)
- ZAWSZE disaster recovery plan

## 🔒 SECURITY

### Image Scanning
```bash
# Trivy scanning
trivy image kptest-backend:latest

# Snyk scanning
snyk container test kptest-backend:latest
```

### Docker Security Best Practices
```dockerfile
# Non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -D appuser
USER appuser

# Minimal base image
FROM alpine:3.18

# Read-only filesystem
RUN chmod -R 555 /app
```

### Kubernetes Security
- NetworkPolicies dla izolacji ruchu
- PodSecurityPolicies/Standards
- RBAC dla access control
- Secrets encryption at rest
- Regular security audits

## 📊 MONITORING

### Prometheus Metrics
- JVM metrics (backend)
- Node.js metrics (frontend)
- Container metrics (CPU, memory, network)
- Custom business metrics

### Grafana Dashboards
- Application health
- Request rates and latency
- Error rates
- Resource utilization

### Alerting Rules
- High error rate (>1%)
- High latency (p99 > 1s)
- Low disk space (<10%)
- Pod restarts (>3 w 5 min)
