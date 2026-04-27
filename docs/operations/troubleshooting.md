# Troubleshooting Guide

## Overview

This guide provides troubleshooting procedures for common issues in the KPTEST system. Use this guide to diagnose and resolve production issues.

## Troubleshooting Methodology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Troubleshooting Process                                 │
│                                                                              │
│  1. Identify                                                                 │
│     • What is the symptom?                                                   │
│     • When did it start?                                                     │
│     • What changed recently?                                                 │
│                                                                              │
│  2. Gather Information                                                       │
│     • Check dashboards                                                       │
│     • Review logs                                                            │
│     • Collect metrics                                                        │
│                                                                              │
│  3. Hypothesize                                                              │
│     • What could cause this?                                                 │
│     • What evidence supports each theory?                                    │
│                                                                              │
│  4. Test                                                                     │
│     • Reproduce the issue                                                    │
│     • Test hypotheses                                                        │
│                                                                              │
│  5. Resolve                                                                  │
│     • Apply fix                                                              │
│     • Verify resolution                                                      │
│     • Document learnings                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Common Issues

### Application Issues

#### High Error Rate

**Symptoms:**
- Increased 5xx responses
- Error alerts firing
- User complaints

**Diagnosis:**
```bash
# Check error rate
curl https://api.kptest.com/actuator/prometheus | \
  grep "http_requests_total{status=~\"5..\"}"

# Check recent errors in logs
kubectl logs -l app=kptest-backend -n kptest-production \
  --tail=500 | grep -i error | head -50

# Check for exceptions
kubectl logs -l app=kptest-backend -n kptest-production \
  --tail=500 | grep -i exception
```

**Common Causes:**
| Cause | Solution |
|-------|----------|
| Database connection issues | Check DB health, connection pool |
| External service failure | Check HIS, email, SMS providers |
| Memory issues | Check heap usage, GC logs |
| Recent deployment | Consider rollback |

#### Slow Response Times

**Symptoms:**
- High latency alerts
- User complaints about slowness
- Timeout errors

**Diagnosis:**
```bash
# Check response time percentiles
curl https://api.kptest.com/actuator/prometheus | \
  grep "http_request_duration_seconds"

# Check slow queries
kubectl exec -n kptest-production deployment/kptest-postgresql -- \
  psql -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check thread pool
kubectl exec -n kptest-production deployment/kptest-backend -- \
  curl localhost:8080/actuator/metrics/http.server.active.requests
```

**Common Causes:**
| Cause | Solution |
|-------|----------|
| Slow database queries | Add indexes, optimize queries |
| High CPU usage | Scale horizontally |
| Memory pressure | Increase heap, scale up |
| Network issues | Check VPC, security groups |

#### Application Not Starting

**Symptoms:**
- CrashLoopBackOff status
- Pod keeps restarting
- Readiness probe failing

**Diagnosis:**
```bash
# Check pod status
kubectl get pods -n kptest-production

# Check pod events
kubectl describe pod <pod-name> -n kptest-production

# Check container logs
kubectl logs <pod-name> -n kptest-production --previous

# Check resource limits
kubectl get pod <pod-name> -n kptest-production -o jsonpath='{.spec.containers[0].resources}'
```

**Common Causes:**
| Cause | Solution |
|-------|----------|
| OOMKilled | Increase memory limits |
| Configuration error | Check ConfigMaps, Secrets |
| Database connection | Verify DB credentials, network |
| Port conflict | Check container ports |

### Database Issues

#### Connection Pool Exhausted

**Symptoms:**
- "Cannot acquire connection" errors
- Slow queries
- Application timeouts

**Diagnosis:**
```bash
# Check connection pool metrics
curl https://api.kptest.com/actuator/prometheus | \
  grep hikaricp

# Check active connections
kubectl exec -n kptest-production deployment/kptest-postgresql -- \
  psql -c "SELECT count(*) FROM pg_stat_activity;"

# Check max connections
kubectl exec -n kptest-production deployment/kptest-postgresql -- \
  psql -c "SHOW max_connections;"
```

**Solution:**
```yaml
# Increase connection pool size
spring:
  datasource:
    hikari:
      maximum-pool-size: 50  # Increase from default
```

#### Database Slow Queries

**Symptoms:**
- High query latency
- CPU spikes on database
- Application timeouts

**Diagnosis:**
```bash
# Find slow queries
kubectl exec -n kptest-production deployment/kptest-postgresql -- \
  psql -c "SELECT query, calls, mean_exec_time, total_exec_time 
           FROM pg_stat_statements 
           ORDER BY mean_exec_time DESC 
           LIMIT 10;"

# Check for locks
kubectl exec -n kptest-production deployment/kptest-postgresql -- \
  psql -c "SELECT * FROM pg_locks WHERE NOT granted;"

# Check table bloat
kubectl exec -n kptest-production deployment/kptest-postgresql -- \
  psql -c "SELECT schemaname, relname, n_dead_tup, n_live_tup 
           FROM pg_stat_user_tables 
           ORDER BY n_dead_tup DESC 
           LIMIT 10;"
```

**Solution:**
```sql
-- Add index
CREATE INDEX CONCURRENTLY idx_patients_last_name ON kptest.patients(last_name);

-- Vacuum table
VACUUM ANALYZE kptest.patients;

-- Kill long-running query
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE state = 'active' AND query_start < now() - interval '30 minutes';
```

#### Replication Lag

**Symptoms:**
- Read replicas returning stale data
- Replication lag alerts

**Diagnosis:**
```bash
# Check replication status
kubectl exec -n kptest-production deployment/kptest-postgresql -- \
  psql -c "SELECT client_addr, state, sent_lsn, write_lsn, 
                  replay_lsn, replay_lag 
           FROM pg_stat_replication;"
```

**Solution:**
- Check network between primary and replica
- Verify replica has sufficient resources
- Check for long-running queries on primary

### Kubernetes Issues

#### Pod Pending

**Symptoms:**
- Pod stuck in Pending state
- Deployment not progressing

**Diagnosis:**
```bash
# Check pod events
kubectl describe pod <pod-name> -n kptest-production

# Check node resources
kubectl top nodes

# Check PVC status
kubectl get pvc -n kptest-production
```

**Common Causes:**
| Cause | Solution |
|-------|----------|
| Insufficient resources | Scale down other workloads or add nodes |
| PVC not bound | Check StorageClass, capacity |
| Node affinity | Check node labels |
| Resource quotas | Check namespace quotas |

#### Pod CrashLoopBackOff

**Symptoms:**
- Pod keeps restarting
- Restart count increasing

**Diagnosis:**
```bash
# Check restart count
kubectl get pods -n kptest-production

# Check previous logs
kubectl logs <pod-name> -n kptest-production --previous

# Check events
kubectl get events -n kptest-production --sort-by='.lastTimestamp'
```

**Common Causes:**
| Cause | Solution |
|-------|----------|
| Application error | Fix application bug |
| OOMKilled | Increase memory limits |
| Liveness probe failing | Adjust probe settings |
| Configuration error | Fix ConfigMap/Secret |

### Network Issues

#### Service Not Accessible

**Symptoms:**
- Connection refused errors
- Service endpoint not reachable

**Diagnosis:**
```bash
# Check service endpoints
kubectl get endpoints <service-name> -n kptest-production

# Check service selector
kubectl get service <service-name> -n kptest-production -o jsonpath='{.spec.selector}'

# Check pod labels
kubectl get pods -n kptest-production --show-labels

# Test connectivity from within cluster
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://<service-name>:<port>
```

#### DNS Issues

**Symptoms:**
- Service name resolution failing
- Intermittent connectivity

**Diagnosis:**
```bash
# Test DNS resolution
kubectl run -it --rm dns-test --image=busybox:1.28 --restart=Never -- \
  nslookup kubernetes.default

# Check CoreDNS pods
kubectl get pods -n kube-system -l k8s-app=kube-dns

# Check CoreDNS logs
kubectl logs -n kube-system -l k8s-app=kube-dns
```

### External Service Issues

#### HIS Integration Failure

**Symptoms:**
- Patient verification failing
- HIS timeout errors

**Diagnosis:**
```bash
# Check HIS health endpoint
curl -f https://api.kptest.com/actuator/health/his

# Check HIS logs
kubectl logs -l app=kptest-backend -n kptest-production | grep -i his

# Test HIS connectivity
kubectl exec -n kptest-production deployment/kptest-backend -- \
  curl -v https://his.external.system/api/health
```

**Solution:**
- Verify HIS API key is valid
- Check network policies allow outbound traffic
- Contact HIS provider if service is down

#### Email/SMS Delivery Failure

**Symptoms:**
- Notifications not being sent
- High failure rate in metrics

**Diagnosis:**
```bash
# Check provider status
curl https://api.kptest.com/actuator/health/email
curl https://api.kptest.com/actuator/health/sms

# Check provider logs
kubectl logs -l app=kptest-backend -n kptest-production | grep -i "sendgrid\|twilio"

# Check API keys
kubectl get secret kptest-secrets -n kptest-production
```

## Debugging Tools

### kubectl Commands

```bash
# Get all resources in namespace
kubectl get all -n kptest-production

# Watch pod status
kubectl get pods -n kptest-production -w

# Execute command in pod
kubectl exec -it <pod-name> -n kptest-production -- /bin/bash

# Port forward for local debugging
kubectl port-forward <pod-name> -n kptest-production 8080:8080

# Copy files from pod
kubectl cp <pod-name>:/path/to/file ./local-file -n kptest-production
```

### Application Debugging

```bash
# Enable debug logging
kubectl patch configmap kptest-config -n kptest-production \
  --type=json -p='[{"op": "replace", "path": "/data/log-level", "value": "DEBUG"}]'

# Get thread dump
kubectl exec -n kptest-production deployment/kptest-backend -- \
  kill -3 1

# Get heap dump
kubectl exec -n kptest-production deployment/kptest-backend -- \
  jmap -dump:format=b,file=/tmp/heap.hprof 1
kubectl cp kptest-backend-xxx:/tmp/heap.hprof ./heap.hprof -n kptest-production
```

## Emergency Contacts

| Issue | Contact |
|-------|---------|
| Database | DBA: dba@kptest.com |
| Infrastructure | DevOps: devops@kptest.com |
| Application | Backend Lead: backend-lead@kptest.com |
| Security | Security: security@kptest.com |

---

**Last Updated:** 2026-04-24
**Version:** 1.0.0
