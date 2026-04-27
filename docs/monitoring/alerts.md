# Alert Documentation

## Overview

This document describes all monitoring alerts configured for KPTEST production environment.

---

## Alert Severity Levels

| Severity | Response Time | Notification | Examples |
|----------|---------------|--------------|----------|
| **Critical** | Immediate | PagerDuty + Slack + Email | Service down, data loss |
| **Warning** | 1 hour | Slack + Email | High resource usage, elevated errors |
| **Info** | Next business day | Email only | Routine notifications |

---

## Backend Alerts

### BackendDown

| Property | Value |
|----------|-------|
| Severity | Critical |
| Threshold | `up{job="backend"} == 0` for 1m |
| Team | Backend |

**Description**: Backend service is unreachable

**Runbook**: 
1. Check pod status: `kubectl get pods -n kptest-production -l app=kptest-backend`
2. Review logs: `kubectl logs -l app=kptest-backend -n kptest-production`
3. Check recent deployments

---

### BackendHighErrorRate

| Property | Value |
|----------|-------|
| Severity | Warning |
| Threshold | Error rate > 5% for 5m |
| Team | Backend |

**Description**: Backend error rate exceeds 5%

**Runbook**:
1. Check application logs for exceptions
2. Review recent changes
3. Check database connectivity

---

### BackendSlowResponse

| Property | Value |
|----------|-------|
| Severity | Warning |
| Threshold | p95 latency > 2s for 5m |
| Team | Backend |

**Description**: Backend response time is elevated

**Runbook**:
1. Check database query performance
2. Review slow query logs
3. Check resource utilization

---

## Database Alerts

### PostgreSQLDown

| Property | Value |
|----------|-------|
| Severity | Critical |
| Threshold | `up{job="postgres"} == 0` for 1m |
| Team | Database |

**Description**: PostgreSQL database is unreachable

**Runbook**:
1. Check pod status: `kubectl get pods -n kptest-production -l app=kptest-postgres`
2. Review PostgreSQL logs
3. Check disk space: `kubectl exec -it kptest-postgres-0 -- df -h`

---

### PostgreSQLHighConnections

| Property | Value |
|----------|-------|
| Severity | Warning |
| Threshold | Connections > 80 for 5m |
| Team | Database |

**Description**: High number of database connections

**Runbook**:
1. Check active queries: `SELECT * FROM pg_stat_activity;`
2. Identify long-running queries
3. Consider scaling connection pool

---

## Redis Alerts

### RedisDown

| Property | Value |
|----------|-------|
| Severity | Critical |
| Threshold | `up{job="redis"} == 0` for 1m |
| Team | Backend |

**Description**: Redis cache is unreachable

**Runbook**:
1. Check pod status
2. Review Redis logs
3. Check memory usage

---

### RedisLowHitRate

| Property | Value |
|----------|-------|
| Severity | Warning |
| Threshold | Hit rate < 80% for 10m |
| Team | Backend |

**Description**: Redis cache hit rate is low

**Runbook**:
1. Review cache eviction policy
2. Check memory allocation
3. Analyze cache key patterns

---

## Infrastructure Alerts

### HighMemoryUsage

| Property | Value |
|----------|-------|
| Severity | Warning |
| Threshold | Memory > 85% for 5m |
| Team | Infrastructure |

**Description**: System memory usage is high

**Runbook**:
1. Check memory by pod: `kubectl top pods -n kptest-production`
2. Identify memory leaks
3. Consider scaling

---

### HighDiskUsage

| Property | Value |
|----------|-------|
| Severity | Warning |
| Threshold | Disk > 85% for 10m |
| Team | Infrastructure |

**Description**: System disk usage is high

**Runbook**:
1. Check disk usage: `kubectl exec -it <pod> -- df -h`
2. Clean up old logs
3. Expand storage if needed

---

## Alert Routing

| Alert | Receiver | Channel |
|-------|----------|---------|
| Critical | PagerDuty | Phone + Push |
| Backend | Backend Team | Slack #backend-alerts |
| Database | DBA Team | Email + Slack |
| Infrastructure | DevOps | Slack #infra-alerts |

---

## Silencing Alerts

### Planned Maintenance

```yaml
# In Alertmanager
matchers:
  - alertname =~ ".+"
  - environment = "production"
startsAt: 2026-04-24T02:00:00Z
endsAt: 2026-04-24T06:00:00Z
createdBy: devops-team
comment: "Planned maintenance window"
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-04-24
