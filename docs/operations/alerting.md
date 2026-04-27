# Alerting Guide

## Overview

This guide describes the alerting strategy for the KPTEST system, including alert rules, notification channels, and incident response procedures.

## Alerting Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        KPTEST Alerting Flow                                  │
│                                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │  Prometheus  │────▶│ Alertmanager │────▶│  PagerDuty   │                │
│  │  (Metrics)   │     │  (Routing)   │     │  (On-call)   │                │
│  └──────────────┘     └──────┬───────┘     └──────────────┘                │
│                              │                                              │
│                              ├──────────────────────────────┐               │
│                              │                              │               │
│                              ▼                              ▼               │
│                       ┌──────────────┐            ┌──────────────┐         │
│                       │    Slack     │            │    Email     │         │
│                       │  (Team Chat) │            │ (Stakeholders)│        │
│                       └──────────────┘            └──────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Alert Severity Levels

| Severity | Description | Response Time | Notification |
|----------|-------------|---------------|--------------|
| **Critical** | System down, data loss | Immediate | Page + Slack + Email |
| **High** | Major functionality impaired | < 30 min | Slack + Email |
| **Medium** | Partial degradation | < 2 hours | Slack |
| **Low** | Minor issues | < 24 hours | Email/Ticket |

## Alert Rules

### Infrastructure Alerts

```yaml
# Prometheus alert rules
groups:
- name: infrastructure
  rules:
  
  # Node alerts
  - alert: NodeDown
    expr: up{job="node"} == 0
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Node {{ $labels.instance }} is down"
      description: "Node has been unreachable for more than 5 minutes"
      
  - alert: HighCPUUsage
    expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage on {{ $labels.instance }}"
      description: "CPU usage is above 80% for more than 10 minutes"
      
  - alert: HighMemoryUsage
    expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage on {{ $labels.instance }}"
      description: "Memory usage is above 85%"
      
  - alert: LowDiskSpace
    expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 15
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "Low disk space on {{ $labels.instance }}"
      description: "Disk space is below 15%"
```

### Application Alerts

```yaml
- name: application
  rules:
  
  - alert: HighErrorRate
    expr: |
      sum(rate(http_requests_total{status=~"5.."}[5m])) / 
      sum(rate(http_requests_total[5m])) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is above 5% for more than 5 minutes"
      
  - alert: HighLatency
    expr: |
      histogram_quantile(0.99, 
        sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 2
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "High latency detected"
      description: "p99 latency is above 2 seconds"
      
  - alert: PodCrashLooping
    expr: |
      increase(kube_pod_container_status_restarts_total[1h]) > 3
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Pod {{ $labels.pod }} is crash looping"
      description: "Pod has restarted more than 3 times in the last hour"
      
  - alert: DeploymentReplicasMismatch
    expr: |
      kube_deployment_status_replicas_available != 
      kube_deployment_spec_replicas
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "Deployment {{ $labels.deployment }} has replica mismatch"
      description: "Available replicas don't match desired replicas"
```

### Database Alerts

```yaml
- name: database
  rules:
  
  - alert: DatabaseDown
    expr: pg_up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "PostgreSQL database is down"
      description: "Database has been unreachable for more than 1 minute"
      
  - alert: HighConnectionUsage
    expr: |
      pg_stat_activity_count / pg_settings_max_connections * 100 > 80
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "High database connection usage"
      description: "Connection usage is above 80%"
      
  - alert: SlowQueries
    expr: |
      rate(pg_stat_statements_seconds_total[5m]) > 1
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "Slow queries detected"
      description: "Query execution time is elevated"
      
  - alert: ReplicationLag
    expr: |
      pg_replication_lag_seconds > 30
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Database replication lag"
      description: "Replication lag is above 30 seconds"
```

### Business Alerts

```yaml
- name: business
  rules:
  
  - alert: LowAdherenceAlert
    expr: |
      kptest_patients_below_threshold > 20
    for: 1h
    labels:
      severity: medium
    annotations:
      summary: "High number of patients with low adherence"
      description: "{{ $value }} patients have adherence below threshold"
      
  - alert: MessageBacklog
    expr: |
      kptest_unread_messages > 100
    for: 2h
    labels:
      severity: medium
    annotations:
      summary: "Large message backlog"
      description: "{{ $value }} unread messages"
      
  - alert: FailedNotifications
    expr: |
      rate(kptest_notifications_failed_total[15m]) > 0.1
    for: 15m
    labels:
      severity: high
    annotations:
      summary: "High notification failure rate"
      description: "Notification failure rate is elevated"
```

### Security Alerts

```yaml
- name: security
  rules:
  
  - alert: MultipleFailedLogins
    expr: |
      sum(rate(login_failures_total[5m])) by (user) > 5
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Multiple failed login attempts for user"
      description: "User {{ $labels.user }} has multiple failed logins"
      
  - alert: UnauthorizedAccessAttempts
    expr: |
      sum(rate(http_requests_total{status="403"}[5m])) > 10
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Multiple unauthorized access attempts"
      description: "High rate of 403 responses"
      
  - alert: SuspiciousActivity
    expr: |
      sum(rate(audit_log_suspicious_total[10m])) > 5
    for: 10m
    labels:
      severity: high
    annotations:
      summary: "Suspicious activity detected"
      description: "Multiple suspicious activities logged"
```

## Notification Configuration

### Alertmanager Configuration

```yaml
# alertmanager.yml
global:
  smtp_smarthost: 'smtp.sendgrid.net:587'
  smtp_from: 'alerts@kptest.com'
  slack_api_url: 'https://hooks.slack.com/services/xxx/yyy/zzz'
  pagerduty_url: 'https://events.pagerduty.com/v2/enqueue'

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'default'
  routes:
  - match:
      severity: critical
    receiver: 'pagerduty-critical'
    continue: true
  - match:
      severity: critical
    receiver: 'slack-critical'
  - match:
      severity: high
    receiver: 'slack-high'
  - match:
      severity: medium
    receiver: 'slack-medium'
  - match:
      severity: low
    receiver: 'email-low'

receivers:
- name: 'default'
  email_configs:
  - to: 'team@kptest.com'

- name: 'pagerduty-critical'
  pagerduty_configs:
  - service_key: '<pagerduty-service-key>'
    severity: critical

- name: 'slack-critical'
  slack_configs:
  - channel: '#alerts-critical'
    send_resolved: true
    title: '🚨 CRITICAL: {{ .GroupLabels.alertname }}'
    text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

- name: 'slack-high'
  slack_configs:
  - channel: '#alerts-high'
    send_resolved: true
    title: '⚠️ HIGH: {{ .GroupLabels.alertname }}'

- name: 'slack-medium'
  slack_configs:
  - channel: '#alerts-medium'
    send_resolved: true
    title: '📋 MEDIUM: {{ .GroupLabels.alertname }}'

- name: 'email-low'
  email_configs:
  - to: 'team@kptest.com'
    send_resolved: true
```

### On-Call Schedule

```yaml
# PagerDuty schedule
on_call_schedule:
  timezone: Europe/Warsaw
  shifts:
  - name: "Primary On-Call"
    rotation: weekly
    start_day: Monday
    handoff_time: "09:00"
    users:
    - devops-lead@kptest.com
    - backend-lead@kptest.com
    - senior-dev-1@kptest.com
    - senior-dev-2@kptest.com
    
  - name: "Secondary On-Call"
    rotation: weekly
    start_day: Monday
    handoff_time: "09:00"
    users:
    - cto@kptest.com
    - tech-lead@kptest.com
```

## Incident Response

### Alert Triage

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Alert Response Flow                                   │
│                                                                              │
│  Alert Received                                                            │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────┐                                                        │
│  │ Acknowledge     │                                                        │
│  │ (within 5 min)  │                                                        │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐                                                        │
│  │ Assess Impact   │                                                        │
│  │ • Users affected│                                                        │
│  │ • Functionality │                                                        │
│  │ • Data risk     │                                                        │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐                                                        │
│  │ Investigate     │                                                        │
│  │ • Check logs    │                                                        │
│  │ • Check metrics │                                                        │
│  │ • Reproduce     │                                                        │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐                                                        │
│  │ Resolve         │                                                        │
│  │ • Fix issue     │                                                        │
│  │ • Verify        │                                                        │
│  │ • Document      │                                                        │
│  └─────────────────┘                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Escalation Policy

| Time | Action |
|------|--------|
| 0-15 min | Primary on-call investigates |
| 15-30 min | Escalate to secondary if no progress |
| 30-60 min | Escalate to tech lead/CTO |
| 60+ min | Executive notification |

## Alert Maintenance

### Regular Review

- **Weekly:** Review alert noise and false positives
- **Monthly:** Update thresholds based on trends
- **Quarterly:** Audit alert coverage and gaps

### Alert Hygiene

1. **Every alert should be actionable** - If you can't act on it, remove it
2. **Clear descriptions** - Include context and impact
3. **Runbook links** - Link to troubleshooting guides
4. **Regular testing** - Test alerts in staging

### Silencing Alerts

```bash
# Silence alert in Alertmanager UI
# URL: https://alertmanager.kptest.com

# Or via API
curl -X POST https://alertmanager.kptest.com/api/v1/silences \
  -H "Content-Type: application/json" \
  -d '{
    "matchers": [{"name": "alertname", "value": "HighCPUUsage"}],
    "startsAt": "2026-04-24T10:00:00Z",
    "endsAt": "2026-04-24T12:00:00Z",
    "createdBy": "admin",
    "comment": "Maintenance window"
  }'
```

---

**Last Updated:** 2026-04-24
**Version:** 1.0.0
