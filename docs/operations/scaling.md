# Scaling Guide

## Overview

This guide describes the scaling strategies for the KPTEST system, including horizontal and vertical scaling, auto-scaling configuration, and capacity planning.

## Scaling Strategies

### Horizontal vs Vertical Scaling

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Scaling Strategies                                    │
│                                                                              │
│  Horizontal Scaling (Scale Out)                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│  │  Pod 1   │  │  Pod 2   │  │  Pod 3   │  │  Pod 4   │  ← Add more pods   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                    │
│                                                                              │
│  Pros: Better fault tolerance, no downtime                                  │
│  Cons: Application must be stateless                                        │
│                                                                              │
│  Vertical Scaling (Scale Up)                                                 │
│  ┌──────────────────┐      ┌──────────────────────────┐                     │
│  │  Pod (2 CPU,     │  →   │  Pod (4 CPU,             │  ← Increase resources│
│  │       4GB RAM)   │      │       8GB RAM)           │                     │
│  └──────────────────┘      └──────────────────────────┘                     │
│                                                                              │
│  Pros: Simple, no code changes                                              │
│  Cons: Downtime during resize, hardware limits                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Kubernetes Auto-Scaling

### Horizontal Pod Autoscaler (HPA)

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

### Vertical Pod Autoscaler (VPA)

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: kptest-backend-vpa
  namespace: kptest-production
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: kptest-backend
  updatePolicy:
    updateMode: Auto  # Off, Initial, Recreate, Auto
  resourcePolicy:
    containerPolicies:
    - containerName: backend
      minAllowed:
        cpu: 250m
        memory: 512Mi
      maxAllowed:
        cpu: 2000m
        memory: 4Gi
      controlledResources:
      - cpu
      - memory
```

### Cluster Autoscaler

```yaml
# Cluster autoscaler configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: cluster-autoscaler-config
  namespace: kube-system
data:
  scan-interval: "10s"
  scale-down-delay-after-add: "10m"
  scale-down-unneeded-time: "10m"
  scale-down-utilization-threshold: "0.5"
  max-node-provision-time: "15m"
  expander: "least-waste"  # random, most-pods, least-waste, price
```

## Scaling by Component

### Backend Scaling

#### Current Configuration

```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "1000m"

replicas:
  min: 3
  max: 20
  target: 5
```

#### Scaling Triggers

| Metric | Scale Up | Scale Down |
|--------|----------|------------|
| CPU | > 70% for 5 min | < 30% for 10 min |
| Memory | > 80% for 5 min | < 50% for 10 min |
| Request Queue | > 100 | < 10 |
| Response Time (p99) | > 1s | < 500ms |

#### Manual Scaling

```bash
# Scale to specific replica count
kubectl scale deployment kptest-backend --replicas=10 -n kptest-production

# Scale based on load estimate
# Formula: replicas = (expected_rps * avg_latency_ms) / 1000 / target_cpu_utilization
# Example: 1000 rps * 200ms / 1000 / 0.7 = ~286 → round up considering concurrent requests
```

### Frontend Scaling

#### Current Configuration

```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "200m"

replicas:
  min: 2
  max: 10
  target: 3
```

#### Scaling Considerations

Frontend is typically CPU-bound (serving static files):
- Scale based on request rate
- Consider CDN for static assets
- Use browser caching

### Database Scaling

#### Read Replicas

```yaml
# PostgreSQL read replica configuration
apiVersion: v1
kind: Service
metadata:
  name: kptest-postgresql-read
  namespace: kptest-production
spec:
  selector:
    app: postgresql
    role: replica
  ports:
  - port: 5432
    targetPort: 5432
```

#### Connection Pooling

```yaml
# PgBouncer configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pgbouncer
  namespace: kptest-production
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: pgbouncer
        image: bitnami/pgbouncer:latest
        env:
        - name: PGBOUNCER_POOL_MODE
          value: "transaction"
        - name: PGBOUNCER_MAX_CLIENT_CONN
          value: "1000"
        - name: PGBOUNCER_DEFAULT_POOL_SIZE
          value: "50"
```

#### Vertical Scaling

```bash
# Scale up database instance
# AWS RDS example
aws rds modify-db-instance \
  --db-instance-identifier kptest-production \
  --db-instance-class db.r6g.xlarge \
  --apply-immediately
```

## Capacity Planning

### Load Estimation

#### Current Metrics

```bash
# Get current load metrics
kubectl top pods -n kptest-production
kubectl top nodes

# Get request rates
curl https://api.kptest.com/actuator/prometheus | \
  grep "http_requests_total"
```

#### Growth Projection

| Metric | Current | 6 Months | 12 Months |
|--------|---------|----------|-----------|
| Daily Active Users | 500 | 1,000 | 2,000 |
| Requests/Second | 50 | 100 | 200 |
| Database Size | 50GB | 100GB | 200GB |
| Storage | 100GB | 200GB | 500GB |

### Resource Calculation

#### Backend Capacity

```
Formula: pods = (rps × latency_ms) / (1000 × target_utilization)

Current:
- Peak RPS: 100
- Avg Latency: 200ms
- Target CPU: 70%

pods = (100 × 200) / (1000 × 0.7) = 28.6 → 5 pods (with headroom)

Future (2x load):
pods = (200 × 200) / (1000 × 0.7) = 57.1 → 10 pods
```

#### Database Capacity

```
Formula: IOPS = (reads_per_sec + writes_per_sec) × avg_io_size

Current:
- Reads: 1000/sec
- Writes: 100/sec
- Avg IO: 8KB

IOPS = (1000 + 100) × 8 = 8,800 KB/s ≈ 8.8 MB/s

With 2x growth: 17.6 MB/s → Ensure storage can handle
```

## Scaling Procedures

### Planned Scaling Event

```bash
#!/bin/bash
# planned-scaling.sh

TARGET_REPLICAS=${1:-10}
NAMESPACE="kptest-production"

echo "=== Planned Scaling Event ==="
echo "Target replicas: ${TARGET_REPLICAS}"
echo "Time: $(date)"

# 1. Check current state
echo "Current state:"
kubectl get hpa -n ${NAMESPACE}
kubectl get pods -n ${NAMESPACE} -l app=kptest-backend

# 2. Update HPA max if needed
if [ ${TARGET_REPLICAS} -gt 20 ]; then
    echo "Updating HPA max replicas..."
    kubectl patch hpa kptest-backend-hpa -n ${NAMESPACE} \
      --type=json -p="[{\"op\": \"replace\", \"path\": \"/spec/maxReplicas\", \"value\": ${TARGET_REPLICAS}}]"
fi

# 3. Scale deployment
echo "Scaling deployment..."
kubectl scale deployment kptest-backend --replicas=${TARGET_REPLICAS} -n ${NAMESPACE}

# 4. Monitor rollout
echo "Monitoring rollout..."
kubectl rollout status deployment/kptest-backend -n ${NAMESPACE} --timeout=600s

# 5. Verify
echo "Verification:"
kubectl get pods -n ${NAMESPACE} -l app=kptest-backend
kubectl top pods -n ${NAMESPACE} -l app=kptest-backend

echo "=== Scaling Complete ==="
```

### Emergency Scaling

```bash
#!/bin/bash
# emergency-scaling.sh

NAMESPACE="kptest-production"

echo "=== Emergency Scaling ==="

# Check current error rate
ERROR_RATE=$(curl -s https://api.kptest.com/actuator/prometheus | \
  grep "http_requests_total{status=~\"5..\"}" | awk '{sum+=$1} END {print sum}')

if (( $(echo "$ERROR_RATE > 0.05" | bc -l) )); then
    echo "High error rate detected: ${ERROR_RATE}"
    echo "Scaling up..."
    
    # Immediate scale up
    CURRENT=$(kubectl get deployment kptest-backend -n ${NAMESPACE} -o jsonpath='{.spec.replicas}')
    TARGET=$((CURRENT * 2))
    
    kubectl scale deployment kptest-backend --replicas=${TARGET} -n ${NAMESPACE}
    
    # Also scale database connections if needed
    # kubectl scale deployment pgbouncer --replicas=4 -n ${NAMESPACE}
    
    echo "Scaled from ${CURRENT} to ${TARGET} replicas"
else
    echo "Error rate normal: ${ERROR_RATE}"
fi
```

## Performance Testing

### Load Testing

```bash
#!/bin/bash
# load-test.sh

TARGET_URL="https://api.kptest.com"
DURATION="5m"
USERS=100

echo "Starting load test..."
echo "Target: ${TARGET_URL}"
echo "Duration: ${DURATION}"
echo "Users: ${USERS}"

# Run k6 load test
k6 run --duration ${DURATION} --vus ${USERS} - <<EOF
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: ${USERS},
  duration: '${DURATION}',
};

export default function() {
  let res = http.get('${TARGET_URL}/api/v1/patients');
  check(res, {
    'status was 200': (r) => r.status == 200,
    'latency < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
EOF

echo "Load test completed"
```

### Stress Testing

```bash
#!/bin/bash
# stress-test.sh

NAMESPACE="kptest-production"

echo "Starting stress test..."

# Gradually increase load
for users in 50 100 200 500 1000; do
    echo "Testing with ${users} users..."
    
    # Run test
    k6 run --vus ${users} --duration 2m stress-test.js
    
    # Check system health
    kubectl top pods -n ${NAMESPACE}
    
    # Check for errors
    ERROR_COUNT=$(kubectl logs -l app=kptest-backend -n ${NAMESPACE} \
      --since 2m | grep -c "ERROR" || true)
    
    echo "Errors during test: ${ERROR_COUNT}"
    
    if [ ${ERROR_COUNT} -gt 100 ]; then
        echo "Too many errors, stopping test"
        break
    fi
    
    sleep 60
done

echo "Stress test completed"
```

## Cost Optimization

### Right-Sizing

```bash
#!/bin/bash
# right-sizing.sh

NAMESPACE="kptest-production"

echo "=== Resource Right-Sizing Analysis ==="

# Get actual resource usage
kubectl top pods -n ${NAMESPACE} --containers

# Compare with requests/limits
echo ""
echo "Compare with configured resources:"
kubectl get pods -n ${NAMESPACE} -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].resources.requests.memory}{"\n"}{end}'

# Recommendations
echo ""
echo "Recommendations:"
# - If usage < 50% of request for 7 days, reduce request
# - If usage > 80% of limit, increase limit
# - Consider VPA for automatic right-sizing
```

### Spot Instances

For non-critical workloads:

```yaml
# Node group with spot instances
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig
metadata:
  name: kptest-production
nodeGroups:
  - name: spot-workers
    spot: true
    instancesDistribution:
      instanceTypes:
      - m6i.large
      - m6i.xlarge
      - m5.large
      - m5.xlarge
      onDemandBaseCapacity: 2
      onDemandPercentageAboveBaseCapacity: 20
```

---

**Last Updated:** 2026-04-24
**Version:** 1.0.0
