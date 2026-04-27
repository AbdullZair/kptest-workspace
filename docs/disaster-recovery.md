# Disaster Recovery Plan

## Overview

This document defines the disaster recovery (DR) strategy for KPTEST production environment. It outlines procedures to recover from various failure scenarios while meeting defined RTO and RPO objectives.

---

## Recovery Objectives

| Metric | Target | Definition |
|--------|--------|------------|
| **RTO (Recovery Time Objective)** | < 4 hours | Maximum acceptable downtime |
| **RPO (Recovery Point Objective)** | < 1 hour | Maximum acceptable data loss |
| **MTTR (Mean Time To Recovery)** | < 2 hours | Target average recovery time |
| **MTBF (Mean Time Between Failures)** | > 720 hours | Target system reliability |

---

## Table of Contents

1. [Failure Scenarios](#failure-scenarios)
2. [Backup Strategy](#backup-strategy)
3. [Recovery Procedures](#recovery-procedures)
4. [Failover Procedure](#failover-procedure)
5. [Communication Plan](#communication-plan)
6. [Testing & Validation](#testing--validation)
7. [DR Runbook](#dr-runbook)

---

## Failure Scenarios

### Scenario Classification

| Severity | Description | Examples | Response Time |
|----------|-------------|----------|---------------|
| **P1 - Critical** | Complete service outage | Cluster failure, data center loss | Immediate |
| **P2 - High** | Major functionality impaired | Database failure, network partition | 15 minutes |
| **P3 - Medium** | Partial degradation | Single pod failure, high latency | 1 hour |
| **P4 - Low** | Minor impact | Non-critical service failure | 4 hours |

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Database corruption | Low | Critical | Hourly backups, point-in-time recovery |
| Cluster failure | Low | Critical | Multi-zone deployment, cluster autoscaling |
| Network outage | Medium | High | Multiple ingress points, CDN fallback |
| Application bug | Medium | High | Rollback capability, canary deployments |
| Security breach | Low | Critical | Security scanning, incident response plan |
| Resource exhaustion | Medium | Medium | HPA, resource quotas, monitoring |

---

## Backup Strategy

### Backup Schedule

| Component | Frequency | Retention | Storage |
|-----------|-----------|-----------|---------|
| PostgreSQL (full) | Daily 02:00 UTC | 30 days | S3 + Local |
| PostgreSQL (WAL) | Continuous | 7 days | S3 |
| PostgreSQL (hourly) | Hourly | 7 days | S3 |
| Application Config | On change | 90 days | Git + S3 |
| Kubernetes Manifests | On change | 90 days | Git |
| Logs | Continuous | 31 days | Loki + S3 |
| Metrics | Continuous | 90 days | Prometheus + S3 |

### Backup Locations

```
Primary:   S3 (eu-central-1) - kptest-backups-production
Secondary: S3 (eu-west-1)    - kptest-backups-dr (cross-region replication)
Local:     /var/backups/kptest (on-premises cache)
```

### Backup Verification

- **Daily**: Automated integrity check
- **Weekly**: Restore test to staging environment
- **Monthly**: Full DR drill

---

## Recovery Procedures

### Database Recovery

#### Point-in-Time Recovery

```bash
# Restore to specific timestamp
./scripts/restore-db.sh \
  --from-s3 \
  --timestamp 20260424_140000 \
  --encrypt-key "$ENCRYPTION_KEY"

# Verify restore
kubectl exec -it kptest-postgres-0 -n kptest-production -- \
  psql -U kptest -d kptest -c "SELECT COUNT(*) FROM users;"
```

#### Full Database Restore

```bash
# Download latest backup
aws s3 cp s3://kptest-backups-production/postgresql/latest/ \
  /var/backups/kptest/ --recursive

# Restore
./scripts/restore-db.sh \
  --file kptest_backup_latest.sql.gz \
  --encrypt-key "$ENCRYPTION_KEY"
```

### Application Recovery

#### Single Pod Failure

```bash
# Kubernetes auto-recovers pods
# Verify recovery
kubectl get pods -n kptest-production -l app=kptest-backend
kubectl describe pod <pod-name> -n kptest-production
```

#### Deployment Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/kptest-backend -n kptest-production
kubectl rollout undo deployment/kptest-frontend -n kptest-production

# Verify rollback
kubectl rollout status deployment/kptest-backend -n kptest-production
```

#### Full Application Redeploy

```bash
# Trigger production deployment workflow
# GitHub Actions -> deploy-production.yml
# Or manual deployment:

kubectl apply -f devops/k8s/production/
kubectl rollout restart deployment/kptest-backend -n kptest-production
kubectl rollout restart deployment/kptest-frontend -n kptest-production
```

---

## Failover Procedure

### Automatic Failover Triggers

| Condition | Action | Threshold |
|-----------|--------|-----------|
| Pod crash | Auto-restart | Immediate |
| Node failure | Pod rescheduling | 30 seconds |
| Zone failure | Cross-zone scaling | 2 minutes |
| Region failure | DNS failover | 5 minutes |

### Manual Failover Decision Tree

```
Service Degradation Detected
         |
         v
    ┌─────────────────┐
    │ Can auto-recover? │
    └────────┬────────┘
             │
     ┌───────┴───────┐
     │               │
    YES             NO
     │               │
     v               v
[Auto-recover]  [Assess severity]
     │               │
     │         ┌─────┴─────┐
     │         │           │
     │       P1/P2       P3/P4
     │         │           │
     │         v           v
     │   [Initiate DR]  [Monitor]
     │         │
     │         v
     │   [Notify team]
     │         │
     │         v
     │   [Execute runbook]
     │         │
     │         v
     │   [Verify recovery]
     │         │
     │         v
     │   [Post-mortem]
     │
     v
[Monitor & Alert]
```

### Failover Steps

1. **Assess Situation** (5 minutes)
   - Review alerts and dashboards
   - Identify affected components
   - Determine severity level

2. **Notify Team** (2 minutes)
   - Page on-call engineer
   - Notify DevOps team Slack channel
   - Create incident channel

3. **Execute Recovery** (variable)
   - Follow appropriate runbook
   - Document all actions
   - Communicate status updates

4. **Verify Recovery** (10 minutes)
   - Run health checks
   - Verify data integrity
   - Monitor error rates

5. **Post-Incident** (within 24 hours)
   - Conduct post-mortem
   - Document lessons learned
   - Update runbooks

---

## Communication Plan

### Internal Communication

| Channel | Purpose | Audience |
|---------|---------|----------|
| Slack #incidents | Real-time updates | Engineering team |
| PagerDuty | Critical alerts | On-call engineer |
| Email | Status summaries | All stakeholders |
| Jira | Incident tracking | Engineering team |

### External Communication

| Channel | Purpose | Timing |
|---------|---------|--------|
| Status Page | Public status | Within 15 minutes |
| Email | Customer notification | Within 1 hour |
| Support Portal | Ticket updates | As needed |

### Escalation Matrix

| Time | Action | Contact |
|------|--------|---------|
| 0 min | Auto-page on-call | PagerDuty |
| 15 min | Escalate to senior engineer | Phone |
| 30 min | Escalate to engineering manager | Phone |
| 1 hour | Escalate to CTO | Phone |
| 2 hours | Executive briefing | Conference call |

---

## Testing & Validation

### DR Test Schedule

| Test Type | Frequency | Duration | Participants |
|-----------|-----------|----------|--------------|
| Backup restore | Weekly | 1 hour | DevOps |
| Pod failure | Monthly | 2 hours | DevOps + Backend |
| Database failover | Quarterly | 4 hours | DevOps + DBA |
| Full DR drill | Bi-annually | 8 hours | All teams |

### Test Scenarios

1. **Database Restore Test**
   - Restore latest backup to staging
   - Verify data integrity
   - Measure RTO

2. **Pod Failure Test**
   - Kill random pods
   - Verify auto-recovery
   - Check HPA response

3. **Node Failure Test**
   - Cordon and drain node
   - Verify pod rescheduling
   - Check service continuity

4. **Full DR Drill**
   - Simulate region failure
   - Activate DR site
   - Verify all services
   - Measure RTO/RPO

### Test Results Tracking

| Date | Test Type | RTO Achieved | RPO Achieved | Status |
|------|-----------|--------------|--------------|--------|
| 2026-01-15 | Database Restore | 45 min | 15 min | ✅ Pass |
| 2026-02-20 | Pod Failure | 2 min | 0 min | ✅ Pass |
| 2026-03-15 | Full DR Drill | 2.5 hours | 30 min | ✅ Pass |

---

## DR Runbook

### Runbook: Database Corruption

```
INCIDENT: Database Corruption
SEVERITY: P1 - Critical
RTO: 1 hour
RPO: 1 hour

STEP 1: Assess (5 minutes)
- [ ] Confirm corruption via logs
- [ ] Check backup availability
- [ ] Notify team

STEP 2: Contain (5 minutes)
- [ ] Stop application writes
- [ ] Scale down backend to 0 replicas
- [ ] Take snapshot of corrupted state

STEP 3: Recover (40 minutes)
- [ ] Identify last good backup
- [ ] Run restore-db.sh script
- [ ] Verify data integrity

STEP 4: Restore Service (10 minutes)
- [ ] Scale up backend
- [ ] Run health checks
- [ ] Monitor error rates

STEP 5: Post-Recovery
- [ ] Document timeline
- [ ] Schedule post-mortem
- [ ] Update runbook if needed
```

### Runbook: Complete Cluster Failure

```
INCIDENT: Complete Cluster Failure
SEVERITY: P1 - Critical
RTO: 4 hours
RPO: 1 hour

STEP 1: Assess (10 minutes)
- [ ] Confirm cluster unreachable
- [ ] Check cloud provider status
- [ ] Notify team and stakeholders

STEP 2: Activate DR Site (30 minutes)
- [ ] Provision new cluster in DR region
- [ ] Apply Kubernetes manifests
- [ ] Configure networking

STEP 3: Restore Data (2 hours)
- [ ] Restore database from S3 backup
- [ ] Restore Redis from snapshot
- [ ] Verify data integrity

STEP 4: Deploy Applications (1 hour)
- [ ] Deploy backend from container registry
- [ ] Deploy frontend from container registry
- [ ] Configure ingress and TLS

STEP 5: Update DNS (10 minutes)
- [ ] Update DNS to point to DR site
- [ ] Verify DNS propagation
- [ ] Test end-to-end connectivity

STEP 6: Post-Recovery
- [ ] Monitor system health
- [ ] Plan failback procedure
- [ ] Document lessons learned
```

### Runbook: Security Breach

```
INCIDENT: Security Breach
SEVERITY: P1 - Critical
RTO: Immediate containment
RPO: N/A

STEP 1: Contain (Immediate)
- [ ] Isolate affected components
- [ ] Rotate all secrets
- [ ] Enable enhanced logging

STEP 2: Assess (30 minutes)
- [ ] Identify breach vector
- [ ] Determine scope of compromise
- [ ] Preserve evidence

STEP 3: Eradicate (2 hours)
- [ ] Patch vulnerability
- [ ] Rebuild affected components
- [ ] Scan for backdoors

STEP 4: Recover (1 hour)
- [ ] Deploy patched versions
- [ ] Restore from clean backups
- [ ] Verify integrity

STEP 5: Post-Incident
- [ ] Conduct security audit
- [ ] File regulatory reports if required
- [ ] Update security controls
```

---

## Contact Information

### Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| On-Call Engineer | PagerDuty | - | oncall@kptest.example.com |
| DevOps Lead | - | - | devops-lead@kptest.example.com |
| Database Admin | - | - | dba@kptest.example.com |
| Security Lead | - | - | security@kptest.example.com |

### External Contacts

| Organization | Purpose | Contact |
|--------------|---------|---------|
| AWS Support | Infrastructure | aws.amazon.com/support |
| GitHub Support | CI/CD | support.github.com |
| Let's Encrypt | Certificates | letsencrypt.org/support |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | DevOps Team | Initial version |

---

**Review Schedule**: Quarterly  
**Next Review**: 2026-07-24  
**Owner**: DevOps Team  
**Approved By**: CTO
