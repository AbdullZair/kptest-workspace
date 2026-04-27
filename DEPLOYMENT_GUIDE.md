# KPTEST Deployment Guide

## Overview

Kompleksowy przewodnik wdrożenia systemu KPTEST na środowiska staging i production.

---

## Table of Contents

1. [Wymagania wstępne](#wymagania-wstępne)
2. [Środowiska](#środowiska)
3. [Wdrożenie lokalne (Development)](#wdrożenie-lokalne-development)
4. [Wdrożenie na Staging](#wdrożenie-na-staging)
5. [Wdrożenie na Production](#wdrożenie-na-production)
6. [Monitoring i Logs](#monitoring-i-logs)
7. [Backup & Recovery](#backup--recovery)
8. [Troubleshooting](#troubleshooting)

---

## Wymagania wstępne

### Software
- Docker 24+ z Docker Compose
- Kubernetes 1.27+ (dla production)
- kubectl skonfigurowane z klastrem
- Helm 3+ (opcjonalnie)
- Git

### Dostęp do GitHub
- Repozytorium: `https://github.com/AbdullZair/kptest-workspace`
- Branch: `main`

### GitHub Secrets (wymagane)

Ustaw w GitHub → Settings → Secrets and variables → Actions:

```bash
# Database
DB_HOST=<postgres-host>
DB_PORT=5432
DB_NAME=kptest
DB_USER=kptest
DB_PASSWORD=<secure-password>

# JWT
JWT_SECRET=<min-32-characters-secret>

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Email (SendGrid)
SENDGRID_API_KEY=<your-api-key>
MAIL_FROM=noreply@kptest.com

# SMS (Twilio/SMSAPI)
TWILIO_ACCOUNT_SID=<account-sid>
TWILIO_AUTH_TOKEN=<auth-token>
TWILIO_PHONE_NUMBER=+48123456789

# Kubernetes (dla production)
KUBE_CONFIG=<base64-encoded-kubeconfig>
GHCR_TOKEN=<github-container-registry-token>
```

---

## Środowiska

| Środowisko | URL | Przeznaczenie |
|------------|-----|---------------|
| **Local** | localhost:3000 | Development |
| **Staging** | staging.kptest.com | Testing, UAT |
| **Production** | kptest.com | Production users |

---

## Wdrożenie lokalne (Development)

### Krok 1: Klonowanie repozytorium

```bash
git clone https://github.com/AbdullZair/kptest-workspace.git
cd kptest-workspace
```

### Krok 2: Uruchomienie Docker Compose

```bash
# Uruchom wszystkie usługi
docker compose up -d

# Sprawdź status
docker compose ps

# Zobacz logi
docker compose logs -f
```

### Krok 3: Weryfikacja

```bash
# Backend health
curl http://localhost:8080/api/v1/health

# Frontend
curl http://localhost:3000

# HIS Mock
curl http://localhost:8081/api/v1/health
```

### Dostępne usługi:

| Usługa | URL | Port |
|--------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:8080/api/v1 | 8080 |
| HIS Mock | http://localhost:8081 | 8081 |
| PostgreSQL | localhost | 5432 |
| Redis | localhost | 6379 |

---

## Wdrożenie na Staging

### Krok 1: Konfiguracja środowiska

```bash
# Stwórz plik .env.staging
cp .env.example .env.staging

# Edytuj zmienne dla staging
nano .env.staging
```

### Krok 2: Deploy przez GitHub Actions

Workflow `deploy-staging.yml` uruchamia się automatycznie po push do `main`.

**Sprawdź status:**
```
https://github.com/AbdullZair/kptest-workspace/actions/workflows/deploy-staging.yml
```

### Krok 3: Manualny deploy (opcjonalnie)

```bash
# Zaloguj do klastra
kubectl config use-context staging

# Zastosuj manifesty
kubectl apply -f devops/k8s/staging/

# Sprawdź status
kubectl get pods -n kptest-staging
```

### Krok 4: Weryfikacja

```bash
# Health check
curl https://staging.kptest.com/api/v1/health

# Frontend
curl https://staging.kptest.com
```

---

## Wdrożenie na Production

### Krok 1: Tagowanie release

```bash
# Utwórz tag
git tag v1.1.0
git push origin v1.1.0
```

To uruchomi workflow `deploy-production.yml`.

### Krok 2: Approval w GitHub Actions

1. Wejdź na: `https://github.com/AbdullZair/kptest-workspace/actions/workflows/deploy-production.yml`
2. Kliknij "Review deployments"
3. Zatwierdź deployment do production

### Krok 3: Monitoruj deployment

```bash
# Połącz z klastrem production
kubectl config use-context production

# Sprawdź status
kubectl get pods -n kptest-production
kubectl rollout status deployment/backend -n kptest-production
kubectl rollout status deployment/frontend -n kptest-production
```

### Krok 4: Weryfikacja

```bash
# Health check production
curl https://kptest.com/api/v1/health

# Sprawdź wersję
curl https://kptest.com/api/v1/health | jq .version
```

---

## Monitoring i Logs

### Prometheus Metrics

```bash
# Dostęp do Prometheus
kubectl port-forward svc/prometheus 9090:9090 -n monitoring

# Otwórz w przeglądarce
open http://localhost:9090
```

### Grafana Dashboards

```bash
# Dostęp do Grafana
kubectl port-forward svc/grafana 3000:80 -n monitoring

# Login: admin / admin
open http://localhost:3000
```

**Dashboardy:**
- Backend Performance
- Frontend Performance
- Database Metrics
- Redis Metrics
- Business Metrics (compliance, active users)

### Logs

```bash
# Backend logs
kubectl logs -f deployment/backend -n kptest-production

# Frontend logs
kubectl logs -f deployment/frontend -n kptest-production

# Wszystkie logs z last 1h
kubectl logs --since=1h deployment/backend -n kptest-production
```

### Alerty

Skonfigurowane alerty w `devops/monitoring/alert-rules.yml`:

- BackendDown
- HighErrorRate (>5%)
- HighLatency (p99 >2s)
- PostgreSQLDown
- RedisDown
- HighMemoryUsage (>80%)
- HighDiskUsage (>85%)

---

## Backup & Recovery

### Automated Backup

Backup bazy danych uruchamia się codziennie o 2:00 UTC.

```bash
# Sprawdź ostatnie backupy
kubectl get jobs -n kptest-production | grep backup

# Zobacz backupy w S3
aws s3 ls s3://kptest-backups/database/ --human-readable
```

### Manual Backup

```bash
# Uruchom backup
kubectl create job --from=cronjob/backup-db manual-backup -n kptest-production

# Monitoruj
kubectl get job manual-backup -n kptest-production -w
```

### Point-in-Time Recovery

```bash
# Przywróć z backupu
./scripts/restore-db.sh --backup-id 20260427-020000 --target-time "2026-04-27 10:00:00"
```

---

## Troubleshooting

### Backend nie startuje

```bash
# Sprawdź logi
kubectl logs deployment/backend -n kptest-production

# Sprawdź configmap
kubectl get configmap backend-config -n kptest-production -o yaml

# Sprawdź secrety
kubectl get secret backend-secrets -n kptest-production

# Restart deployment
kubectl rollout restart deployment/backend -n kptest-production
```

### Frontend zwraca 502

```bash
# Sprawdź ingress
kubectl get ingress -n kptest-production

# Sprawdź service
kubectl get svc frontend -n kptest-production

# Sprawdź endpointy
kubectl get endpoints frontend -n kptest-production
```

### Database connection errors

```bash
# Sprawdź czy PostgreSQL działa
kubectl get pods -n kptest-production | grep postgres

# Sprawdź connection string
kubectl exec deployment/backend -n kptest-production -- env | grep DB

# Test połączenia
kubectl exec -it deployment/postgres -n kptest-production -- psql -U kptest -c "SELECT 1"
```

### High memory usage

```bash
# Sprawdź zużycie zasobów
kubectl top pods -n kptest-production

# Zwiększ limity
kubectl edit deployment/backend -n kptest-production
# Zmień resources.limits.memory

# Restart z nowymi limitami
kubectl rollout restart deployment/backend -n kptest-production
```

---

## Rollback Procedure

### Automatic Rollback (jeśli health check fails)

Workflow automatycznie wycofa deployment jeśli health check nie przejdzie.

### Manual Rollback

```bash
# Cofnij do poprzedniej wersji
kubectl rollout undo deployment/backend -n kptest-production

# Cofnij do konkretnej wersji
kubectl rollout undo deployment/backend -n kptest-production --to-revision=2

# Sprawdź status rollback
kubectl rollout status deployment/backend -n kptest-production
```

---

## Security Checklist

- [ ] Wszystkie secrety w Kubernetes Secrets (nie w kodzie)
- [ ] Network Policies włączone (Zero Trust)
- [ ] Pod Security Standards: Restricted
- [ ] RBAC z least privilege
- [ ] TLS/SSL z cert-manager
- [ ] Image scanning (Trivy) w CI/CD
- [ ] Regular security updates
- [ ] Audit logging włączone

---

## Performance Benchmarks

| Metryka | Target | Current |
|---------|--------|---------|
| API Response Time (p95) | <500ms | - |
| API Response Time (p99) | <1s | - |
| Frontend Load Time | <2s | - |
| Database Query Time (p95) | <100ms | - |
| Error Rate | <0.1% | - |
| Availability | 99.5% | - |

---

## Support

### Contact

- **Technical Support:** kptest-support@kptest.com
- **Emergency:** kptest-emergency@kptest.com

### Documentation

- API Docs: `/docs/api/`
- Architecture: `/docs/architecture/`
- Setup Guides: `/docs/setup/`
- User Guides: `/docs/user-guides/`

---

**Last Updated:** 2026-04-27  
**Version:** 1.1.0
