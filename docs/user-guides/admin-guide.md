# Administrator Guide - KPTEST System

## Overview

As an Administrator in KPTEST, you have full system access including user management, system configuration, monitoring, and maintenance. This guide covers all administrative functions.

## Getting Started

### First Login

1. Navigate to https://app.kptest.com
2. Enter administrator credentials
3. Complete 2FA setup (mandatory for admins)
4. Review system dashboard

### Admin Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  KPTEST - Admin Dashboard                                               │
│                                                                         │
│  System Status: ● Healthy                                               │
│                                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │   Users     │ │   Patients  │ │   Projects  │ │   System    │      │
│  │    250      │ │    500      │ │     85      │ │   Health    │      │
│  │  5 pending  │ │  350 active │ │   60 active │ │   99.9%     │      │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                                         │
│  Quick Actions                                                          │
│  [Add User] [System Config] [Backup Now] [View Audit Logs]             │
│                                                                         │
│  Recent Alerts                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ⚠️  High error rate detected - 15 min ago                       │   │
│  │ ℹ️  Backup completed successfully - 2 hours ago                  │   │
│  │ ⚠️  Low disk space on storage - 4 hours ago                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## User Management

### Creating Users

1. Navigate to Admin → Users
2. Click "Add User"
3. Fill in user details:
   - Email (will be username)
   - Temporary password
   - First name
   - Last name
   - Phone number
   - Role
4. Choose notification option:
   - Send invitation email
   - Provide credentials manually
5. Click "Create User"

### User Roles

| Role | Access Level | Description |
|------|-------------|-------------|
| **ADMIN** | Full system | System administration |
| **COORDINATOR** | Patient/Project mgmt | Therapy coordination |
| **THERAPIST** | Assigned patients | Therapy delivery |
| **PATIENT** | Self-service | Mobile app access |

### Managing User Roles

1. Navigate to Admin → Users
2. Find and select user
3. Click "Edit"
4. Change role if needed
5. Click "Save"

**Note:** Role changes take effect immediately

### Deactivating Users

1. Navigate to Admin → Users
2. Select user
3. Click "Deactivate"
4. Confirm deactivation
5. User loses access immediately

**Note:** User data is preserved for audit

### Resetting Passwords

1. Navigate to Admin → Users
2. Select user
3. Click "Reset Password"
4. Choose option:
   - Generate temporary password
   - Send reset email
5. Confirm action

## System Configuration

### General Settings

Navigate to Admin → Settings → General

**Configurable Options:**
- System name
- Support contact
- Session timeout
- Password policy
- Logo and branding

### Email Configuration

Navigate to Admin → Settings → Email

**Settings:**
- Provider (SendGrid)
- From address
- From name
- Reply-to address
- API key

**Test Email:**
1. Enter test recipient
2. Click "Send Test"
3. Verify delivery

### SMS Configuration

Navigate to Admin → Settings → SMS

**Settings:**
- Provider (Twilio)
- From number
- Account SID
- Auth token
- Enable/disable SMS

### HIS Integration

Navigate to Admin → Settings → HIS

**Settings:**
- Enable/disable integration
- API endpoint
- API key
- Timeout settings
- Cache duration

**Test Connection:**
1. Click "Test Connection"
2. Verify response
3. Check logs if failed

## Monitoring

### System Health

Navigate to Admin → Monitoring → Health

**Components:**
- Database status
- Cache status
- External services
- Storage usage
- API response times

**Health Indicators:**
- 🟢 Healthy
- 🟡 Degraded
- 🔴 Unhealthy

### Performance Metrics

Navigate to Admin → Monitoring → Metrics

**Available Metrics:**
- Request rate
- Response times (p50, p95, p99)
- Error rates
- Active users
- Database connections
- Cache hit rate

### Logs

Navigate to Admin → Monitoring → Logs

**Log Types:**
- Application logs
- Access logs
- Error logs
- Audit logs

**Filtering:**
- By date range
- By log level
- By component
- By keyword

## Audit Logs

### Viewing Audit Logs

Navigate to Admin → Audit Logs

**Filter Options:**
- User
- Action type
- Entity type
- Date range
- IP address

**Audit Actions:**
- LOGIN/LOGOUT
- CREATE/UPDATE/DELETE
- EXPORT/IMPORT
- CONFIG_CHANGE
- ASSIGN/REMOVE

### Exporting Audit Logs

1. Navigate to Admin → Audit Logs
2. Apply filters
3. Click "Export"
4. Choose format:
   - CSV
   - JSON
   - PDF
5. Download file

**Retention:** Audit logs retained for 10 years

## Backup Management

### Creating Backup

1. Navigate to Admin → Backup
2. Click "Create Backup"
3. Wait for completion
4. Backup appears in history

### Backup History

Navigate to Admin → Backup → History

**Information Displayed:**
- Backup date
- Size
- Status
- Created by
- Notes

### Restoring from Backup

**Warning:** Restore operation will overwrite all data

1. Navigate to Admin → Backup
2. Select backup to restore
3. Click "Restore"
4. Enter confirmation: "CONFIRM"
5. Add reason for restore
6. Click "Proceed"
7. System enters maintenance mode
8. Restore completes
9. System restarts

### Downloading Backup

1. Navigate to Admin → Backup
2. Select backup
3. Click "Download"
4. Save file securely

## Reports

### System Reports

Navigate to Admin → Reports

**Available Reports:**
- User activity
- Patient statistics
- Project summaries
- Adherence analytics
- System usage

### Generating Reports

1. Navigate to Admin → Reports
2. Select report type
3. Configure parameters:
   - Date range
   - Filters
   - Sections
4. Click "Generate"
5. Export in desired format

### Scheduled Reports

1. Navigate to Admin → Reports → Scheduled
2. Click "Create Schedule"
3. Configure:
   - Report type
   - Recipients
   - Frequency
   - Format
4. Save schedule

## Security

### Access Control

**IP Whitelist:**
1. Navigate to Admin → Security → IP Access
2. Add allowed IP ranges
3. Save configuration

**Session Management:**
1. Navigate to Admin → Security → Sessions
2. View active sessions
3. Revoke suspicious sessions

### Security Settings

Navigate to Admin → Security → Settings

**Configurable:**
- Password requirements
- 2FA enforcement
- Session timeout
- Failed login lockout
- API rate limits

### Security Audit

1. Navigate to Admin → Security → Audit
2. Review:
   - Failed login attempts
   - Privilege escalations
   - Configuration changes
   - Unusual activity

## Maintenance

### Maintenance Mode

1. Navigate to Admin → Maintenance
2. Toggle "Maintenance Mode"
3. Add maintenance message
4. Users see maintenance page

### Cache Management

**Clear Cache:**
1. Navigate to Admin → Maintenance → Cache
2. Select cache type:
   - User cache
   - Configuration cache
   - API cache
   - All caches
3. Click "Clear"

### Database Maintenance

**Vacuum Database:**
1. Navigate to Admin → Maintenance → Database
2. Click "Vacuum"
3. Monitor progress

**Update Statistics:**
1. Navigate to Admin → Maintenance → Database
2. Click "Analyze"
3. Wait for completion

## API Management

### API Keys

Navigate to Admin → API → Keys

**Create API Key:**
1. Click "Create Key"
2. Enter description
3. Select permissions
4. Copy key (shown once)
5. Store securely

**Revoke API Key:**
1. Find key in list
2. Click "Revoke"
3. Confirm action

### API Usage

Navigate to Admin → API → Usage

**Metrics:**
- Request count
- Error rate
- Top endpoints
- Rate limit hits

## Troubleshooting

### Common Issues

**User can't log in:**
- Check user status is active
- Verify credentials
- Check 2FA status
- Review audit logs

**System slow:**
- Check resource usage
- Review slow queries
- Clear cache
- Check external services

**Backup failing:**
- Check storage space
- Verify credentials
- Review backup logs
- Test manually

### System Diagnostics

Navigate to Admin → Diagnostics

**Available Checks:**
- Database connectivity
- Cache connectivity
- External service status
- Storage availability
- Certificate expiry

### Support Contacts

**Internal:**
- DevOps team: devops@kptest.com
- Security team: security@kptest.com

**External:**
- AWS Support: +1-800-XXX-XXXX
- SendGrid: support@sendgrid.com
- Twilio: help@twilio.com

## Emergency Procedures

### Security Incident

1. **Isolate** - Revoke compromised credentials
2. **Assess** - Determine scope of incident
3. **Contain** - Prevent further damage
4. **Notify** - Alert security team
5. **Document** - Record all actions
6. **Recover** - Restore from clean backup

### System Outage

1. **Assess** - Identify affected components
2. **Notify** - Alert stakeholders
3. **Restore** - Follow recovery procedures
4. **Verify** - Confirm system operational
5. **Document** - Record incident details
6. **Review** - Conduct post-incident review

## Best Practices

### Regular Tasks

| Frequency | Task |
|-----------|------|
| Daily | Review alerts and errors |
| Weekly | Review audit logs |
| Weekly | Verify backups |
| Monthly | Review user access |
| Monthly | Security review |
| Quarterly | DR test |
| Quarterly | Performance review |

### Documentation

- Document all configuration changes
- Maintain runbooks for procedures
- Keep contact list updated
- Record incident responses

### Security

- Enable 2FA for all admins
- Rotate credentials regularly
- Review access logs
- Follow least-privilege principle

---

**Last Updated:** 2026-04-24
**Version:** 1.0.0
