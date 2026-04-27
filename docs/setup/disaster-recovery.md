# Disaster Recovery Guide

## Overview

This guide describes the disaster recovery procedures for the KPTEST system, including recovery strategies, roles and responsibilities, and step-by-step recovery processes.

## Disaster Classification

### Severity Levels

| Level | Description | Examples | Response Time |
|-------|-------------|----------|---------------|
| **Critical** | Complete system outage | Data center failure, ransomware | Immediate |
| **High** | Major functionality impaired | Database corruption, primary region down | < 30 minutes |
| **Medium** | Partial functionality impaired | Service degradation, performance issues | < 2 hours |
| **Low** | Minor issues | Single service failure, non-critical bugs | < 24 hours |

### Disaster Scenarios

| Scenario | Likelihood | Impact | Recovery Strategy |
|----------|------------|--------|-------------------|
| Database corruption | Low | High | Restore from backup |
| Data center failure | Low | Critical | Failover to DR region |
| Ransomware attack | Medium | Critical | Restore from clean backup |
| Network outage | Medium | High | DNS failover |
| Application bug | High | Medium | Rollback deployment |
| Configuration error | Medium | Medium | Restore configuration |

## Recovery Objectives

### RPO/RTO by Component

| Component | RPO | RTO | Strategy |
|-----------|-----|-----|----------|
| Database | 1 hour | 4 hours | Hourly backups + PITR |
| File Storage | 24 hours | 8 hours | Daily S3 backup |
| Application | 0 | 1 hour | Blue-green deployment |
| Configuration | 0 | 30 minutes | Git-based config |

## Disaster Recovery Team

### Roles and Responsibilities

| Role | Responsibility | Primary | Backup |
|------|----------------|---------|--------|
| Incident Commander | Overall coordination | CTO | Tech Lead |
| Technical Lead | Technical decisions | Backend Lead | Senior Dev |
| Database Admin | Database recovery | DBA | DevOps |
| DevOps Engineer | Infrastructure recovery | DevOps Lead | SRE |
| Communications | Stakeholder updates | PM | Support Lead |

### Contact List

```yaml
emergency_contacts:
  incident_commander:
    name: "CTO"
    phone: "+48-XXX-XXX-XXX"
    email: "cto@kptest.com"
    
  technical_lead:
    name: "Backend Lead"
    phone: "+48-XXX-XXX-XXX"
    email: "backend-lead@kptest.com"
    
  database_admin:
    name: "DBA"
    phone: "+48-XXX-XXX-XXX"
    email: "dba@kptest.com"
    
  devops_engineer:
    name: "DevOps Lead"
    phone: "+48-XXX-XXX-XXX"
    email: "devops@kptest.com"
    
  communications:
    name: "PM"
    phone: "+48-XXX-XXX-XXX"
    email: "pm@kptest.com"

external_contacts:
  aws_support:
    phone: "+1-800-XXX-XXXX"
    account_id: "XXXX-XXXX-XXXX"
    
  sendgrid_support:
    email: "support@sendgrid.com"
    
  twilio_support:
    email: "help@twilio.com"
```

## Recovery Procedures

### Scenario 1: Database Corruption

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Database Corruption Recovery                              │
│                                                                              │
│  Step 1: Assess Damage                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Identify affected tables/data                                     │    │
│  │ • Determine corruption scope                                        │    │
│  │ • Check backup availability                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  Step 2: Put System in Maintenance Mode                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • kubectl patch configmap kptest-config maintenance-mode=true       │    │
│  │ • Notify users via status page                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  Step 3: Restore from Backup                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Download latest valid backup from S3                              │    │
│  │ • Drop corrupted database                                           │    │
│  │ • Restore from backup                                               │    │
│  │ • Verify data integrity                                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  Step 4: Apply WAL Logs (if available)                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Apply WAL logs up to failure point                                │    │
│  │ • Verify point-in-time recovery                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  Step 5: Bring System Online                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • kubectl patch configmap kptest-config maintenance-mode=false      │    │
│  │ • Verify application connectivity                                   │    │
│  │ • Monitor for issues                                                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Scenario 2: Data Center Failure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Data Center Failover                                      │
│                                                                              │
│  Primary Region: eu-central-1 (Frankfurt)                                    │
│  DR Region: eu-west-1 (Ireland)                                              │
│                                                                              │
│  Step 1: Confirm Outage                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Check AWS Health Dashboard                                        │    │
│  │ • Verify with multiple monitoring tools                             │    │
│  │ • Confirm with AWS support if needed                                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  Step 2: Update DNS                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Update Route53 health check                                       │    │
│  │ • Failover to DR region record                                      │    │
│  │ • Verify DNS propagation                                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  Step 3: Activate DR Infrastructure                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Scale up DR cluster (if scaled down)                              │    │
│  │ • Update database connection strings                                │    │
│  │ • Verify external service connectivity                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  Step 4: Restore Latest Data                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Restore database from latest S3 backup                            │    │
│  │ • Sync file storage from S3 cross-region replication                │    │
│  │ • Verify data consistency                                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  Step 5: Verify and Monitor                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Run health checks                                                 │    │
│  │ • Verify user access                                                │    │
│  │ • Monitor performance                                               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Scenario 3: Ransomware Attack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Ransomware Recovery                                       │
│                                                                              │
│  Step 1: Isolate Affected Systems                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Disconnect affected instances from network                        │    │
│  │ • Revoke compromised credentials                                    │    │
│  │ • Preserve evidence for investigation                               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  Step 2: Assess Impact                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Identify affected systems and data                                │    │
│  │ • Determine ransomware variant                                      │    │
│  │ • Check backup integrity (ensure clean backups)                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  Step 3: Notify Authorities                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Report to law enforcement                                         │    │
│  │ • Notify data protection authority (RODO)                           │    │
│  │ • Prepare user notification if data breached                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  Step 4: Rebuild Infrastructure                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Create new VPC and infrastructure                                 │    │
│  │ • Deploy from clean images                                          │    │
│  │ • Rotate all credentials and keys                                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  Step 5: Restore Data                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Restore from verified clean backups                               │    │
│  │ • Verify data integrity                                             │    │
│  │ • Implement additional security measures                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Failover Testing

### Quarterly DR Test

```yaml
# DR Test Plan Template
test_plan:
  name: "Quarterly Disaster Recovery Test"
  frequency: "Quarterly"
  duration: "4 hours"
  
  objectives:
  - Verify backup restoration
  - Test failover procedures
  - Validate RTO/RPO targets
  - Train team on procedures
  
  scenarios:
  - name: "Database Restore Test"
    steps:
    - Download latest backup from S3
    - Restore to test database
    - Verify data integrity
    - Document restoration time
    
  - name: "Application Failover"
    steps:
    - Deploy application to DR region
    - Update DNS to DR region
    - Verify functionality
    - Failback to primary
    
  - name: "Communication Test"
    steps:
    - Activate emergency contact list
    - Test communication channels
    - Verify stakeholder notification
    
  success_criteria:
  - Database restore < 4 hours
  - Application failover < 1 hour
  - All team members reachable
  - Documentation updated
```

## Post-Incident Activities

### Incident Report Template

```markdown
# Incident Report

## Summary
- **Incident ID:** INC-YYYY-XXXX
- **Date:** YYYY-MM-DD
- **Duration:** X hours Y minutes
- **Severity:** Critical/High/Medium/Low
- **Status:** Resolved

## Timeline
| Time | Event |
|------|-------|
| HH:MM | Incident detected |
| HH:MM | Team notified |
| HH:MM | Recovery started |
| HH:MM | System restored |
| HH:MM | Incident resolved |

## Impact
- Users affected: X
- Data loss: None/X records
- Revenue impact: $X

## Root Cause
[Description of root cause]

## Resolution
[Description of resolution]

## Lessons Learned
- What went well
- What could be improved
- Action items

## Action Items
| Item | Owner | Due Date |
|------|-------|----------|
| [Action] | [Name] | [Date] |
```

## Contact and Escalation

### Escalation Matrix

| Time Elapsed | Action | Contact |
|--------------|--------|---------|
| 0-15 min | Initial response | On-call engineer |
| 15-30 min | Escalate if not resolved | Technical Lead |
| 30-60 min | Escalate to management | CTO |
| 60+ min | Executive notification | CEO, Board |

### Communication Templates

#### Internal Notification

```
Subject: [INCIDENT] System Outage - {{date}}

Team,

We are experiencing a {{severity}} incident affecting {{system}}.

Impact: {{description}}
Current Status: {{status}}
Next Update: {{time}}

Incident Channel: {{slack_channel}}
Bridge Line: {{phone_number}}

- Incident Commander
```

#### User Notification

```
Subject: Service Disruption - {{date}}

Dear User,

We are currently experiencing technical difficulties with {{system}}.

Our team is working to resolve the issue. We expect service to be 
restored by {{eta}}.

We apologize for the inconvenience.

Status Page: {{status_page_url}}

- KPTEST Team
```

---

**Last Updated:** 2026-04-24
**Version:** 1.0.0
