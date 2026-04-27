# Monitoring Guide

## Overview

This guide describes the monitoring architecture and procedures for the KPTEST system, including metrics collection, dashboards, and observability best practices.

## Monitoring Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        KPTEST Monitoring Stack                               │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Metrics Collection                              │    │
│  │                                                                       │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │    │
│  │  │  Prometheus  │  │  Node        │  │  Application │              │    │
│  │  │  (Metrics)   │  │  Exporter    │  │  Metrics     │              │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Logging                                         │    │
│  │                                                                       │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │    │
│  │  │  Fluentd     │  │  Elastic-    │  │  Kibana      │              │    │
│  │  │  (Collector) │  │  search      │  │  (Dashboard) │              │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Visualization                                   │    │
│  │                                                                       │    │
│  │  ┌──────────────┐  ┌──────────────┐                                 │    │
│  │  │  Grafana     │  │  Custom      │                                 │    │
│  │  │  (Dashboards)│  │  Dashboards  │                                 │    │
│  │  └──────────────┘  └──────────────┘                                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Alerting                                        │    │
│  │                                                                       │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │    │
│  │  │  Alertmanager│  │  PagerDuty   │  │  Slack       │              │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Metrics

### Application Metrics

#### JVM Metrics (Spring Boot Actuator)

```yaml
# Available JVM metrics
jvm_memory_used_bytes{area="heap"}
jvm_memory_used_bytes{area="nonheap"}
jvm_gc_pause_seconds
jvm_threads_live
jvm_threads_daemon
```

#### HTTP Metrics

```yaml
# Request metrics
http_requests_total{method="GET",status="200",uri="/api/v1/patients"}
http_request_duration_seconds{quantile="0.95"}
http_requests_active
```

#### Business Metrics

```yaml
# Patient metrics
kptest_patients_total
kptest_patients_active
kptest_patients_new_total

# Project metrics
kptest_projects_total
kptest_projects_active

# Adherence metrics
kptest_adherence_average
kptest_adherence_below_threshold

# Message metrics
kptest_messages_sent_total
kptest_messages_response_time_seconds
```

### Infrastructure Metrics

#### Kubernetes Metrics

```yaml
# Pod metrics
kube_pod_status_phase
kube_pod_container_status_ready
kube_pod_container_resource_requests
kube_pod_container_resource_limits

# Deployment metrics
kube_deployment_status_replicas_available
kube_deployment_status_replicas_unavailable

# Node metrics
kube_node_status_condition
node_cpu_usage_seconds_total
node_memory_usage_bytes
```

#### Database Metrics

```yaml
# PostgreSQL metrics
pg_up
pg_stat_database_numbackends
pg_stat_database_tup_returned
pg_stat_database_tup_fetched
pg_locks_count

# Connection pool (HikariCP)
hikaricp_connections_active
hikaricp_connections_idle
hikaricp_connections_pending
```

#### Redis Metrics

```yaml
# Redis metrics
redis_up
redis_connected_clients
redis_used_memory_bytes
redis_ops_per_sec
redis_keyspace_hits_total
redis_keyspace_misses_total
```

## Dashboards

### Grafana Dashboards

#### System Overview

URL: https://grafana.kptest.com/d/system-overview

**Panels:**
- System health status
- Request rate (req/s)
- Error rate (%)
- Response time (p50, p95, p99)
- Active users
- CPU/Memory usage

#### Application Performance

URL: https://grafana.kptest.com/d/app-performance

**Panels:**
- Endpoint latency heatmap
- Error rate by endpoint
- Throughput by service
- JVM metrics
- GC pause times

#### Database Monitoring

URL: https://grafana.kptest.com/d/database

**Panels:**
- Connection pool usage
- Query latency
- Transaction rate
- Lock wait times
- Replication lag

#### Business Metrics

URL: https://grafana.kptest.com/d/business

**Panels:**
- Patient enrollment trend
- Active projects
- Average adherence
- Message volume
- Task completion rate

### Custom Dashboards

Create custom dashboards for:
- Release monitoring
- Feature adoption
- A/B test results
- Cost tracking

## Logging

### Log Levels

| Level | Description | Example |
|-------|-------------|---------|
| ERROR | Application errors | Exception, failed request |
| WARN | Warning conditions | Deprecated API, slow query |
| INFO | Informational | Request received, user login |
| DEBUG | Debug information | Method entry, variable values |
| TRACE | Detailed trace | Full request/response body |

### Log Format

```json
{
  "timestamp": "2026-04-24T10:00:00.000Z",
  "level": "INFO",
  "thread": "http-nio-8080-exec-1",
  "logger": "com.kptest.backend.controller.PatientController",
  "message": "Patient retrieved successfully",
  "traceId": "abc123",
  "spanId": "def456",
  "userId": "user-789",
  "patientId": "patient-012",
  "duration_ms": 45
}
```

### Log Aggregation

Logs are collected and stored in Elasticsearch:

```bash
# Search logs in Kibana
# URL: https://kibana.kptest.com

# Example queries:
# Find errors in last hour
level: ERROR AND @timestamp > now-1h

# Find logs for specific user
userId: "user-789"

# Find slow requests
duration_ms > 1000
```

## Distributed Tracing

### Trace Context

```
Request Flow:
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Frontend │────▶│  Backend │────▶│ Database │
│          │     │          │     │          │
│ traceId  │     │ traceId  │     │          │
│ spanId:1 │     │ spanId:2 │     │          │
└──────────┘     └──────────┘     └──────────┘
```

### Trace Investigation

```bash
# Find trace by ID in Jaeger/Zipkin
# URL: https://jaeger.kptest.com

# Search by:
# - Trace ID
# - Service name
# - Operation name
# - Duration
# - Tags
```

## Health Checks

### Endpoint Types

```yaml
# Liveness probe
/actuator/health/liveness
# Returns: UP if application is running

# Readiness probe
/actuator/health/readiness
# Returns: UP if application is ready to serve traffic

# Full health
/actuator/health
# Returns: Detailed health status
```

### Health Indicators

```yaml
health:
  status: UP
  components:
    db:
      status: UP
      details:
        database: PostgreSQL
        validationQuery: isValid()
    redis:
      status: UP
      details:
        version: 7.0.0
    diskSpace:
      status: UP
      details:
        total: 100GB
        free: 45GB
    mail:
      status: UP
      details:
        location: smtp.sendgrid.net
```

## Monitoring Best Practices

### Golden Signals

Monitor these four key metrics:

1. **Latency** - Time to serve requests
2. **Traffic** - Request rate
3. **Errors** - Error rate
4. **Saturation** - Resource utilization

### Alerting Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Error Rate | > 1% | > 5% |
| p99 Latency | > 1s | > 3s |
| CPU Usage | > 70% | > 90% |
| Memory Usage | > 80% | > 95% |
| Disk Usage | > 70% | > 90% |

### Runbooks

For each alert, maintain a runbook with:
- Alert description
- Impact assessment
- Troubleshooting steps
- Escalation path
- Resolution procedures

---

**Last Updated:** 2026-04-24
**Version:** 1.0.0
