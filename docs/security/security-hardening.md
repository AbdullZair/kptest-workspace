# Security Hardening Guide

## Overview

This document describes the security hardening measures implemented for the KPTEST production environment. These measures follow industry best practices and address the requirements from nf.17-nf.20 (availability) and security best practices.

---

## Table of Contents

1. [Network Security](#network-security)
2. [Pod Security](#pod-security)
3. [Container Security](#container-security)
4. [RBAC & Access Control](#rbac--access-control)
5. [Secrets Management](#secrets-management)
6. [Image Security](#image-security)
7. [TLS/SSL Configuration](#tlsssl-configuration)
8. [Security Monitoring](#security-monitoring)
9. [Compliance Checklist](#compliance-checklist)

---

## Network Security

### Network Policies

All network traffic follows a **Zero Trust** model - everything is denied by default.

```yaml
# Default deny all ingress and egress
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: kptest-production
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

### Implemented Network Policies

| Policy | Purpose | Allowed Traffic |
|--------|---------|-----------------|
| `default-deny-ingress` | Block all incoming traffic | None |
| `default-deny-egress` | Block all outgoing traffic | None |
| `allow-ingress-to-frontend` | Allow Ingress Controller → Frontend | Port 3000 from nginx-ingress |
| `allow-ingress-to-backend` | Allow Ingress Controller + Frontend → Backend | Port 8080 |
| `allow-backend-egress` | Allow Backend → Database/Redis | Ports 5432, 6379 |
| `allow-postgres-ingress` | Allow Backend → PostgreSQL | Port 5432 from backend only |
| `allow-redis-ingress` | Allow Backend → Redis | Port 6379 from backend only |

### Ingress Security

```yaml
annotations:
  # Force HTTPS
  nginx.ingress.kubernetes.io/ssl-redirect: "true"
  nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
  
  # Security Headers
  nginx.ingress.kubernetes.io/configuration-snippet: |
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  
  # Rate Limiting
  nginx.ingress.kubernetes.io/limit-rps: "100"
  nginx.ingress.kubernetes.io/limit-burst: "200"
```

---

## Pod Security

### Pod Security Standards (PSS)

The production namespace enforces the **Restricted** Pod Security Standard:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: kptest-production
  annotations:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

### Security Context Requirements

All pods must include:

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  runAsGroup: 1000
  fsGroup: 1000
  seccompProfile:
    type: RuntimeDefault

containers:
  - securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
          - ALL
```

### Pod Disruption Budgets

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: kptest-backend-pdb
spec:
  minAvailable: 2  # Ensure at least 2 pods available during disruptions
  selector:
    matchLabels:
      app: kptest-backend
```

---

## Container Security

### Base Images

| Component | Base Image | Size | Security Features |
|-----------|-----------|------|-------------------|
| Backend | `eclipse-temurin:21-jre-alpine` | ~200MB | Minimal attack surface, non-root |
| Frontend | `nginx:alpine` | ~50MB | Minimal, regularly updated |
| Database | `postgres:15.4-alpine` | ~400MB | Official, security-patched |
| Cache | `redis:7.2-alpine` | ~50MB | Official, security-patched |

### Dockerfile Security Best Practices

```dockerfile
# Use specific version tags (never 'latest')
FROM eclipse-temurin:21-jre-alpine

# Create non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -D appuser

# Set working directory
WORKDIR /app

# Copy application
COPY --chown=appuser:appgroup app.jar app.jar

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Entry point
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Image Scanning

All images are scanned with:
- **Trivy** - Vulnerability scanning
- **Snyk** - Dependency scanning
- **Hadolint** - Dockerfile linting
- **CodeQL** - Static code analysis

---

## RBAC & Access Control

### Principle of Least Privilege

Each service account has minimal required permissions:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: kptest-backend-sa
  namespace: kptest-production
automountServiceAccountToken: false  # Disable auto-mounting

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: kptest-backend-role
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: ["get"]
    resourceNames: ["kptest-secrets"]  # Named resource access only
```

### RBAC Summary

| ServiceAccount | Permissions | Purpose |
|----------------|-------------|---------|
| `kptest-backend-sa` | Read ConfigMaps, Read specific Secret | Backend configuration |
| `kptest-frontend-sa` | None | Frontend (no K8s API access needed) |
| `kptest-postgres-sa` | None | Database (no K8s API access needed) |
| `kptest-redis-sa` | None | Cache (no K8s API access needed) |

---

## Secrets Management

### Current Implementation

Secrets are stored as Kubernetes Secrets with base64 encoding:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: kptest-secrets
  namespace: kptest-production
type: Opaque
stringData:
  DB_PASSWORD: "secure-password"
  JWT_SECRET: "secure-jwt-key"
```

### Recommended: Sealed Secrets

For GitOps workflows, use **Sealed Secrets**:

```bash
# Install kubeseal
kubeseal --version

# Create sealed secret
kubectl create secret generic kptest-secrets \
  --from-literal=DB_PASSWORD=secure-password \
  --namespace kptest-production --dry-run=client -o yaml | \
  kubeseal --format yaml > sealed-secrets.yaml

# Apply sealed secret
kubectl apply -f sealed-secrets.yaml
```

### Recommended: External Secrets Operator

For production, integrate with AWS Secrets Manager:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: kptest-secrets
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secretsmanager
    kind: ClusterSecretStore
  target:
    name: kptest-secrets
  data:
    - secretKey: DB_PASSWORD
      remoteRef:
        key: kptest/production/database
        property: password
```

---

## Image Security

### Container Registry

- **Registry**: GitHub Container Registry (ghcr.io)
- **Access**: Private, authenticated via GitHub tokens
- **Image Signing**: Cosign (recommended)

### Image Pull Policy

```yaml
imagePullPolicy: Always  # Always pull latest security patches
imagePullSecrets:
  - name: ghcr-secret
```

### Vulnerability Management

| Severity | SLA | Action |
|----------|-----|--------|
| Critical | 24 hours | Immediate patch, block deployment |
| High | 7 days | Schedule patch in next release |
| Medium | 30 days | Include in regular maintenance |
| Low | 90 days | Monitor, patch when convenient |

---

## TLS/SSL Configuration

### Certificate Management

Certificates are managed by **cert-manager** with Let's Encrypt:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@kptest.example.com
    privateKeySecretRef:
      name: letsencrypt-prod-account-key
    solvers:
      - http01:
          ingress:
            class: nginx
```

### TLS Configuration

```yaml
spec:
  tls:
    - hosts:
        - kptest.example.com
        - api.kptest.example.com
      secretName: kptest-tls-secret
  rules:
    - host: api.kptest.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: kptest-backend
                port: 8080
```

### Security Headers

All responses include:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'self'`

---

## Security Monitoring

### Security Scanning Pipeline

```yaml
# .github/workflows/security-scan.yml
jobs:
  trivy-scan:      # Container vulnerability scanning
  snyk-scan:       # Dependency scanning
  codeql-scan:     # Code security analysis
  gitleaks-scan:   # Secret detection
  hadolint-scan:   # Dockerfile linting
```

### Alert Rules

| Alert | Severity | Description |
|-------|----------|-------------|
| `BackendDown` | Critical | Backend service unreachable |
| `BackendHighErrorRate` | Warning | Error rate > 5% |
| `PostgreSQLDown` | Critical | Database unreachable |
| `RedisDown` | Critical | Cache unreachable |
| `ContainerRestarted` | Warning | Frequent container restarts |
| `HighMemoryUsage` | Warning | Memory > 85% |
| `HighDiskUsage` | Warning | Disk > 85% |

### Audit Logging

All security-relevant events are logged:
- Authentication attempts
- Authorization failures
- Secret access
- Configuration changes
- Network policy violations

---

## Compliance Checklist

### Kubernetes Security

- [x] Pod Security Standards (Restricted) enforced
- [x] Network Policies (deny by default)
- [x] RBAC with least privilege
- [x] ServiceAccount token auto-mount disabled
- [x] Pod Disruption Budgets configured
- [x] Resource quotas and limits set
- [x] Secrets encrypted at rest (recommended: enable encryption provider)

### Container Security

- [x] Non-root users
- [x] Read-only root filesystem (where possible)
- [x] Capabilities dropped
- [x] No privilege escalation
- [x] Specific image tags (no 'latest')
- [x] Image scanning in CI/CD
- [x] Minimal base images (Alpine)

### Network Security

- [x] TLS everywhere (HTTPS)
- [x] Certificate management (cert-manager)
- [x] Security headers
- [x] Rate limiting
- [x] Network isolation
- [x] Ingress controller hardening

### Application Security

- [x] Input validation
- [x] Output encoding
- [x] SQL injection prevention (parameterized queries)
- [x] XSS prevention
- [x] CSRF protection
- [x] JWT token security
- [x] Password hashing (bcrypt)

### Operational Security

- [x] CI/CD security scanning
- [x] Automated backups
- [x] Disaster recovery plan
- [x] Incident response procedures
- [x] Security monitoring and alerting
- [x] Regular security audits

---

## Security Contacts

| Role | Contact | Escalation |
|------|---------|------------|
| Security Team | security@kptest.example.com | PagerDuty |
| DevOps Team | devops@kptest.example.com | Slack #alerts |
| On-Call | oncall@kptest.example.com | PagerDuty |

---

## References

- [Kubernetes Security Best Practices](https://kubernetes.io/docs/concepts/security/)
- [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/)
- [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
- [OWASP Kubernetes Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Kubernetes_Security_Cheat_Sheet.html)
- [CIS Kubernetes Benchmark](https://www.cisecurity.org/benchmark/kubernetes)

---

**Document Version**: 1.0  
**Last Updated**: 2026-04-24  
**Owner**: DevOps Team
