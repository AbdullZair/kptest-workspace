# CI/CD Pipeline Documentation

Kompletna dokumentacja pipeline'ów CI/CD dla projektu KPTEST.

## Struktura Workflow

```
.github/workflows/
├── backend-ci.yml      # Backend CI/CD (Java/Spring Boot)
├── frontend-ci.yml     # Frontend CI/CD (React/TypeScript)
├── mobile-ci.yml       # Mobile CI/CD (React Native/Expo)
├── deploy.yml          # Kubernetes deployment
└── code-quality.yml    # Code quality checks
```

## Workflow Szczegóły

### 1. Backend CI (`backend-ci.yml`)

**Trigger:**
- Push do branch `main` lub `develop` ze zmianami w `backend/`
- Pull Request do branch `main` lub `develop`

**Joby:**
| Job | Opis |
|-----|------|
| `build` | JDK 21 setup, Gradle build, testy, Jacoco coverage |
| `docker` | Build i push Docker image do GHCR |
| `health-check` | Uruchomienie kontenera i sprawdzenie `/actuator/health` |

**Artefakty:**
- Coverage reports: `backend/build/reports/jacoco/test/`
- Test results: `backend/build/test-results/test/`

**Docker Image Tags:**
- `main` - dla branch main
- `<sha>` - commit SHA
- `<version>` - semantic version (z tagów)

### 2. Frontend CI (`frontend-ci.yml`)

**Trigger:**
- Push do branch `main` lub `develop` ze zmianami w `frontend/`
- Pull Request do branch `main` lub `develop`

**Joby:**
| Job | Opis |
|-----|------|
| `build` | Node.js 20, npm ci, lint, test, build |
| `docker` | Build i push Docker image do GHCR |
| `health-check` | Sprawdzenie dostępności aplikacji |

**Komendy:**
```bash
npm ci
npm run lint
npm run type-check
npm run test -- --run --coverage
npm run build
```

### 3. Mobile CI (`mobile-ci.yml`)

**Trigger:**
- Push do branch `main` lub `develop` ze zmianami w `mobile/`
- Pull Request do branch `main` lub `develop`

**Joby:**
| Job | Opis |
|-----|------|
| `build` | Node.js 20, npm ci, lint, type-check, test |
| `eas-build` | Walidacja konfiguracji EAS Build |

**Komendy:**
```bash
npm ci
npm run lint
npm run type-check
npm run test -- --watchAll=false
npx expo-doctor
```

### 4. Deploy Workflow (`deploy.yml`)

**Trigger:**
- Push tagu w formacie `v*.*.*` (np. `v1.0.0`, `v2.1.3`)

**Joby:**
| Job | Opis |
|-----|------|
| `deploy` | Deploy do Kubernetes cluster |

**Kroki:**
1. Logowanie do GHCR
2. Extract version from tag
3. Setup kubectl
4. Deploy backend + frontend
5. Rollout status check
6. Health check
7. Create GitHub Release

**Namespace:** `kptest`

### 5. Code Quality (`code-quality.yml`)

**Trigger:**
- Push do branch `main` lub `develop`
- Pull Request do branch `main` lub `develop`

**Joby:**
| Job | Opis |
|-----|------|
| `backend-quality` | Spotless check, dependency check |
| `frontend-quality` | ESLint, Prettier, npm audit |
| `mobile-quality` | ESLint, npm audit |
| `security-scan` | CodeQL analysis |

## Docker Registry (GHCR)

Obrazy Docker są pushowane do GitHub Container Registry:

```
ghcr.io/abdullzair/kptest-workspace/backend:<tag>
ghcr.io/abdullzair/kptest-workspace/frontend:<tag>
```

**Authentykacja:**
- Używany jest `GITHUB_TOKEN` automatycznie dostępny w GitHub Actions
- Kubernetes wymaga sekretu `ghcr-secret` do pullowania obrazów

## Kubernetes Deployment

### Manifesty

```
devops/k8s/
├── namespace.yaml            # kptest namespace
├── configmap.yaml            # Konfiguracja aplikacji
├── secrets.yaml              # Wrażliwe dane (template)
├── image-pull-secret.yaml    # GHCR auth (template)
├── postgres-deployment.yaml  # PostgreSQL StatefulSet
├── redis-deployment.yaml     # Redis Deployment
├── backend-deployment.yaml   # Backend Deployment + Service
├── frontend-deployment.yaml  # Frontend Deployment + Service
└── ingress.yaml              # Ingress (optional)
```

### Architektura

```
┌─────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                │
│  ┌─────────────────────────────────────────────┐    │
│  │              Namespace: kptest               │    │
│  │                                              │    │
│  │  ┌──────────────┐    ┌──────────────┐       │    │
│  │  │   Ingress    │───▶│   Frontend   │       │    │
│  │  │  (optional)  │    │  (LoadBalancer)│      │    │
│  │  └──────────────┘    └──────┬───────┘       │    │
│  │                             │                │    │
│  │                             ▼                │    │
│  │                      ┌──────────────┐       │    │
│  │                      │   Backend    │       │    │
│  │                      │ (ClusterIP)  │       │    │
│  │                      └──────┬───────┘       │    │
│  │                             │                │    │
│  │            ┌────────────────┼────────────┐  │    │
│  │            ▼                ▼            │  │    │
│  │     ┌────────────┐   ┌────────────┐      │  │    │
│  │     │  Postgres  │   │   Redis    │      │  │    │
│  │     │  (Stateful)│   │            │      │  │    │
│  │     └────────────┘   └────────────┘      │  │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

## Instrukcja Użycia

### Pierwsza Konfiguracja

1. **Skonfiguruj sekrety GitHub:**
   ```bash
   # Zobacz .github/SECRETS.md dla szczegółów
   ```

2. **Przygotuj Kubernetes cluster:**
   ```bash
   # Utwórz namespace
   kubectl apply -f devops/k8s/namespace.yaml
   
   # Utwórz image pull secret
   kubectl create secret docker-registry ghcr-secret \
     --docker-server=ghcr.io \
     --docker-username=<github-username> \
     --docker-password=<github-pat> \
     --docker-email=<email> \
     -n kptest
   
   # Skonfiguruj sekrety aplikacji
   # Edytuj devops/k8s/secrets.yaml z właściwymi wartościami
   kubectl apply -f devops/k8s/secrets.yaml -n kptest
   kubectl apply -f devops/k8s/configmap.yaml -n kptest
   ```

3. **Deploy infrastruktury:**
   ```bash
   kubectl apply -f devops/k8s/postgres-deployment.yaml -n kptest
   kubectl apply -f devops/k8s/redis-deployment.yaml -n kptest
   ```

### Triggerowanie Deployments

**Automatyczny CI:**
- Wypchnij zmiany do `backend/`, `frontend/`, lub `mobile/`
- Workflow uruchomi się automatycznie

**Deploy na produkcję:**
```bash
# Wypchnij tag wersji
git tag v1.0.0
git push origin v1.0.0

# Deploy workflow uruchomi się automatycznie
```

### Manualny Deploy

```bash
# Apply wszystkich manifestów
kubectl apply -f devops/k8s/ -n kptest

# Restart deploymentów po zmianie sekretów
kubectl rollout restart deployment/kptest-backend -n kptest
kubectl rollout restart deployment/kptest-frontend -n kptest

# Sprawdź status
kubectl get pods -n kptest
kubectl get services -n kptest
kubectl get deployments -n kptest
```

### Monitorowanie

```bash
# Logi backendu
kubectl logs -f deployment/kptest-backend -n kptest

# Logi frontendu
kubectl logs -f deployment/kptest-frontend -n kptest

# Status rollout
kubectl rollout status deployment/kptest-backend -n kptest
kubectl rollout status deployment/kptest-frontend -n kptest

# Health check
kubectl exec deployment/kptest-backend -n kptest -- \
  curl -s http://localhost:8080/actuator/health
```

## Troubleshooting

### Workflow nie uruchamia się

1. Sprawdź czy ścieżki plików się zgadzają
2. Weryfikuj branch name (`main` vs `master`)
3. Sprawdź GitHub Actions permissions w ustawieniach repozytorium

### Docker build failure

```bash
# Lokalny build testowy
cd backend
docker build -t test-backend .

cd frontend
docker build -t test-frontend .
```

### Kubernetes deployment failure

```bash
# Sprawdź eventy
kubectl get events -n kptest --sort-by='.lastTimestamp'

# Sprawdź describe deployment
kubectl describe deployment kptest-backend -n kptest

# Sprawdź logs
kubectl logs deployment/kptest-backend -n kptest
```

### Health check failure

```bash
# Port forward do backendu
kubectl port-forward deployment/kptest-backend 8080:8080 -n kptest

# Test ręczny
curl http://localhost:8080/actuator/health
```

## Best Practices

1. **Tagowanie wersji:** Używaj semantic versioning (`vMAJOR.MINOR.PATCH`)
2. **Code Review:** Wymagaj approval przed merge do `main`
3. **Test Coverage:** Minimalne 80% coverage dla nowego kodu
4. **Secret Rotation:** Rotuj sekrety co 90 dni
5. **Backup:** Regularny backup bazy danych PostgreSQL

## Zasoby

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Kubernetes Docs](https://kubernetes.io/docs/)
- [GHCR Docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
