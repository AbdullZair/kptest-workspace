---
name: Deployment Architecture (Kubernetes)
description: Kubernetes deployment architecture and infrastructure configuration
type: architecture
---

# Deployment Architecture (Kubernetes)

## Overview

This document describes the Kubernetes deployment architecture for the KPTEST system, including cluster configuration, resource definitions, networking, and scaling strategies.

## Cluster Architecture

### Production Cluster

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Kubernetes Cluster (Production)                      │
│                           Region: eu-central-1                               │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        Control Plane                                   │  │
│  │                                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │   API Server │  │   Scheduler  │  │   Controller │                │  │
│  │  │              │  │              │  │   Manager    │                │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │  │
│  │                                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐                                   │  │
│  │  │     etcd     │  │   Cloud      │                                   │  │
│  │  │   Cluster    │  │   Controller │                                   │  │
│  │  └──────────────┘  └──────────────┘                                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         Worker Nodes                                   │  │
│  │                                                                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Node 1    │  │   Node 2    │  │   Node 3    │  │   Node 4    │  │  │
│  │  │             │  │             │  │             │  │             │  │  │
│  │  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │  │  │
│  │  │ │  Pods   │ │  │ │  Pods   │ │  │ │  Pods   │ │  │ │  Pods   │ │  │  │
│  │  │ │         │ │  │ │         │ │  │ │         │ │  │ │         │ │  │  │
│  │  │ │ Backend │ │  │ │Backend  │ │  │ │Frontend │ │  │ │ Backend │ │  │  │
│  │  │ │ x2      │ │  │ │ x2      │ │  │ │ x3      │ │  │ │ x2      │ │  │  │
│  │  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │  │  │
│  │  │             │  │             │  │             │  │             │  │  │
│  │  │ 4 vCPU      │  │ 4 vCPU      │  │ 4 vCPU      │  │ 4 vCPU      │  │  │
│  │  │ 16GB RAM    │  │ 16GB RAM    │  │ 16GB RAM    │  │ 16GB RAM    │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        Managed Services                                │  │
│  │                                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │    RDS       │  │   ElastiCache│  │     S3       │                │  │
│  │  │  PostgreSQL  │  │    Redis     │  │   Storage    │                │  │
│  │  │   (Multi-AZ) │  │   (Cluster)  │  │              │                │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Namespace Structure

```yaml
# Namespace definitions
apiVersion: v1
kind: Namespace
metadata:
  name: kptest-production
  labels:
    environment: production
    team: kptest

---
apiVersion: v1
kind: Namespace
metadata:
  name: kptest-staging
  labels:
    environment: staging
    team: kptest

---
apiVersion: v1
kind: Namespace
metadata:
  name: kptest-monitoring
  labels:
    environment: production
    team: platform
```

## Application Deployments

### Backend Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kptest-backend
  namespace: kptest-production
  labels:
    app: kptest-backend
    version: v1
spec:
  replicas: 5
  selector:
    matchLabels:
      app: kptest-backend
  template:
    metadata:
      labels:
        app: kptest-backend
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/actuator/prometheus"
    spec:
      containers:
      - name: backend
        image: ghcr.io/abdullzair/kptest-backend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
          name: http
          protocol: TCP
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: kptest-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: kptest-config
              key: redis-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: kptest-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 5
        volumeMounts:
        - name: config-volume
          mountPath: /app/config
      volumes:
      - name: config-volume
        configMap:
          name: kptest-backend-config
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchLabels:
                  app: kptest-backend
              topologyKey: kubernetes.io/hostname
```

### Frontend Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kptest-frontend
  namespace: kptest-production
  labels:
    app: kptest-frontend
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: kptest-frontend
  template:
    metadata:
      labels:
        app: kptest-frontend
        version: v1
    spec:
      containers:
      - name: frontend
        image: ghcr.io/abdullzair/kptest-frontend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 80
          name: http
          protocol: TCP
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

### HIS Mock Deployment (Optional)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kptest-his-mock
  namespace: kptest-production
  labels:
    app: kptest-his-mock
spec:
  replicas: 2
  selector:
    matchLabels:
      app: kptest-his-mock
  template:
    metadata:
      labels:
        app: kptest-his-mock
    spec:
      containers:
      - name: his-mock
        image: ghcr.io/abdullzair/kptest-his-mock:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 8081
          name: http
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## Services

### Backend Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: kptest-backend
  namespace: kptest-production
  labels:
    app: kptest-backend
spec:
  type: ClusterIP
  ports:
  - port: 8080
    targetPort: 8080
    protocol: TCP
    name: http
  selector:
    app: kptest-backend
```

### Frontend Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: kptest-frontend
  namespace: kptest-production
  labels:
    app: kptest-frontend
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
    name: http
  selector:
    app: kptest-frontend
```

### External Access (Ingress)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: kptest-ingress
  namespace: kptest-production
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - kptest.com
    - api.kptest.com
    - app.kptest.com
    secretName: kptest-tls
  rules:
  - host: api.kptest.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: kptest-backend
            port:
              number: 8080
  - host: app.kptest.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: kptest-frontend
            port:
              number: 80
```

## Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: kptest-backend-hpa
  namespace: kptest-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: kptest-backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 15
      selectPolicy: Max
```

## ConfigMaps

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kptest-config
  namespace: kptest-production
data:
  redis-url: "redis://kptest-redis-master:6379"
  log-level: "INFO"
  cors-allowed-origins: "https://app.kptest.com,https://kptest.com"
  file-upload-max-size: "52428800"
  session-timeout-minutes: "480"
```

## Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: kptest-secrets
  namespace: kptest-production
type: Opaque
stringData:
  database-url: "jdbc:postgresql://kptest-postgresql:5432/kptest"
  database-username: "kptest_user"
  database-password: "secure-password-here"
  jwt-secret: "your-jwt-secret-key-here"
  jwt-issuer: "kptest.com"
  email-api-key: "sendgrid-api-key-here"
  sms-api-key: "twilio-api-key-here"
```

## Persistent Volume Claims

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: kptest-postgresql-pvc
  namespace: kptest-production
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Gi
  storageClassName: gp3
```

## Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: kptest-backend-network-policy
  namespace: kptest-production
spec:
  podSelector:
    matchLabels:
      app: kptest-backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: kptest-frontend
    - podSelector:
        matchLabels:
          app: nginx-ingress
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgresql
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 443
```

## Resource Quotas

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: kptest-production-quota
  namespace: kptest-production
spec:
  hard:
    requests.cpu: "20"
    requests.memory: "40Gi"
    limits.cpu: "40"
    limits.memory: "80Gi"
    pods: "50"
    persistentvolumeclaims: "10"
    requests.storage: "500Gi"
```

## Monitoring Stack

### Prometheus ServiceMonitor

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: kptest-backend-monitor
  namespace: kptest-monitoring
  labels:
    release: prometheus
spec:
  selector:
    matchLabels:
      app: kptest-backend
  endpoints:
  - port: http
    path: /actuator/prometheus
    interval: 30s
  namespaceSelector:
    matchNames:
    - kptest-production
```

### Grafana Dashboard ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kptest-grafana-dashboard
  namespace: kptest-monitoring
data:
  kptest-dashboard.json: |
    {
      "dashboard": {
        "title": "KPTEST Production Dashboard",
        "panels": [
          {
            "title": "Request Rate",
            "targets": [{"expr": "rate(http_requests_total[5m])"}]
          },
          {
            "title": "Error Rate",
            "targets": [{"expr": "rate(http_requests_total{status=~\"5..\"}[5m])"}]
          },
          {
            "title": "Response Time (p95)",
            "targets": [{"expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"}]
          }
        ]
      }
    }
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

### Blue-Green Deployment

```yaml
# Green deployment (new version)
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
```

### Canary Deployment

```yaml
# Canary deployment (10% traffic)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kptest-backend-canary
  namespace: kptest-production
spec:
  replicas: 1  # 10% of total
  selector:
    matchLabels:
      app: kptest-backend
      track: canary
```

## Health Checks

### Liveness Probe

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 60
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

### Readiness Probe

```yaml
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

### Startup Probe

```yaml
startupProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 0
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 30
```

## Disaster Recovery

### Backup CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: kptest-backup
  namespace: kptest-production
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:15
            command:
            - /bin/sh
            - -c
            - |
              pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > /backup/backup-$(date +%Y%m%d).sql.gz
            env:
            - name: DB_HOST
              value: "kptest-postgresql"
            - name: DB_USER
              valueFrom:
                secretKeyRef:
                  name: kptest-secrets
                  key: database-username
            - name: DB_NAME
              value: "kptest"
            volumeMounts:
            - name: backup-volume
              mountPath: /backup
          volumes:
          - name: backup-volume
            persistentVolumeClaim:
              claimName: kptest-backup-pvc
          restartPolicy: OnFailure
```

---

**Document Version:** 1.0
**Last Updated:** 2026-04-24
**Author:** KPTEST DevOps Agent
