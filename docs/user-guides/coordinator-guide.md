# Coordinator Guide - KPTEST System

## Overview

As a Coordinator in KPTEST, you are responsible for managing patients, creating therapeutic projects, and monitoring therapy progress. This guide covers all coordinator functions.

## Getting Started

### First Login

1. Navigate to https://app.kptest.com
2. Enter your credentials provided by administrator
3. Complete 2FA setup if prompted
4. Familiarize yourself with the dashboard

### Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  KPTEST Dashboard                                                       │
│                                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │  Patients   │ │   Projects  │ │   Messages  │ │   Alerts    │      │
│  │    150      │ │     25      │ │    12       │ │     5       │      │
│  │  +12 this   │ │   20 active │ │  unread     │ │  low adher. │      │
│  │   month     │ │             │ │             │ │             │      │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                                         │
│  Quick Actions: [Add Patient] [Create Project] [Send Message]          │
│                                                                         │
│  Recent Activity                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ • Jan Kowalski completed task "Exercise 1" - 10 min ago         │   │
│  │ • Anna Nowak joined project "Terapia Słuchowa" - 1 hour ago     │   │
│  │ • Low adherence alert: Piotr Wiśniewski (45%) - 2 hours ago     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Patient Management

### Adding a New Patient

**Method 1: Manual Entry**

1. Navigate to Patients → Add Patient
2. Fill in patient details:
   - PESEL (required)
   - First name
   - Last name
   - Email
   - Phone number
   - Emergency contact
3. Click "Create Patient"
4. Patient receives registration email

**Method 2: HIS Verification**

1. Navigate to Patients → Add Patient
2. Click "Verify with HIS"
3. Enter PESEL and medical record number
4. System fetches patient data from HIS
5. Review and confirm patient details
6. Complete registration

### Viewing Patient Details

1. Navigate to Patients
2. Search or filter to find patient
3. Click on patient name
4. View patient profile:
   - Personal information
   - Assigned projects
   - Task adherence
   - Message history
   - Calendar events

### Editing Patient Information

1. Open patient profile
2. Click "Edit"
3. Update information
4. Click "Save Changes"

**Note:** PESEL cannot be changed after creation

### Removing a Patient

1. Open patient profile
2. Click "Actions" → "Deactivate"
3. Confirm deactivation
4. Patient data is retained for compliance

**Note:** Patients are soft-deleted (not permanently removed)

## Project Management

### Creating a Therapeutic Project

1. Navigate to Projects → Create Project
2. Fill in project details:
   - Project name
   - Description
   - Start date
   - End date
   - Therapy type
3. Configure project settings:
   - Task templates
   - Adherence threshold (default: 60%)
   - Notification preferences
4. Assign team members:
   - Lead therapist
   - Supporting therapists
5. Click "Create Project"

### Assigning Patients to Project

1. Open project details
2. Go to "Patients" tab
3. Click "Add Patients"
4. Select patients from list
5. Click "Assign"
6. Patients receive notification

### Managing Project Tasks

**Creating Task Templates:**

1. Open project → Tasks tab
2. Click "Create Template"
3. Define task:
   - Title
   - Description
   - Type (exercise, reading, assessment)
   - Frequency (daily, weekly, one-time)
   - Estimated duration
4. Save template

**Assigning Tasks:**

1. Open project → Tasks tab
2. Click "Assign Tasks"
3. Select task template
4. Choose patients (all or specific)
5. Set due dates
6. Click "Assign"

### Monitoring Project Progress

1. Open project details
2. View dashboard:
   - Patient enrollment
   - Average adherence
   - Task completion rate
   - Upcoming events
3. Click "Reports" for detailed analytics

## Communication

### Sending Messages

**Individual Message:**

1. Navigate to Messages
2. Click "Compose"
3. Select recipient (patient or staff)
4. Enter subject and message
5. Attach files if needed
6. Click "Send"

**Group Message:**

1. Navigate to Messages → Compose
2. Select multiple recipients
3. Or select project to message all members
4. Compose and send message

### Managing Message Threads

1. Navigate to Messages
2. View conversation list
3. Click on conversation to open
4. Reply to messages
5. Mark as read/unread
6. Archive completed threads

## Monitoring and Alerts

### Adherence Monitoring

**Viewing Adherence Reports:**

1. Navigate to Reports → Adherence
2. Filter by:
   - Date range
   - Project
   - Adherence threshold
3. View patient list with adherence scores

**Low Adherence Alerts:**

When a patient's adherence drops below threshold:
1. Alert appears on dashboard
2. Email notification sent
3. Navigate to alert for details
4. Take action:
   - Contact patient
   - Adjust tasks
   - Document intervention

### Generating Reports

**Patient Progress Report:**

1. Navigate to Reports → Patient Progress
2. Select patient
3. Choose date range
4. Select report sections:
   - Task completion
   - Adherence trends
   - Message activity
   - Event attendance
5. Click "Generate"
6. Export as PDF/CSV

**Project Statistics:**

1. Navigate to Reports → Project Stats
2. Select project(s)
3. Choose metrics:
   - Enrollment
   - Completion rates
   - Average adherence
   - Message volume
4. Generate and export

## Calendar Management

### Creating Events

1. Navigate to Calendar
2. Click "Add Event"
3. Fill in event details:
   - Title
   - Date and time
   - Type (individual, group, assessment)
   - Participants
   - Location
   - Notes
4. Set reminders
5. Click "Create"

### Managing Event Types

| Type | Description | Example |
|------|-------------|---------|
| Individual | One-on-one session | Therapy session |
| Group | Multiple patients | Group therapy |
| Assessment | Evaluation appointment | Progress review |
| Deadline | Task due date | Assessment due |
| Reminder | General reminder | Medication reminder |

### Exporting Calendar

1. Navigate to Calendar
2. Click "Export"
3. Choose format (iCal, CSV)
4. Select date range
5. Download calendar file

## Best Practices

### Patient Engagement

1. **Regular Check-ins** - Message patients weekly
2. **Prompt Responses** - Reply within 24 hours
3. **Positive Reinforcement** - Acknowledge good adherence
4. **Early Intervention** - Contact patients with declining adherence
5. **Clear Instructions** - Provide detailed task descriptions

### Documentation

1. **Record Interventions** - Document patient contacts
2. **Track Changes** - Note therapy adjustments
3. **Maintain Notes** - Keep session notes current
4. **Follow Protocols** - Adhere to clinical guidelines

### Time Management

1. **Batch Tasks** - Process messages at set times
2. **Use Templates** - Create message templates
3. **Set Priorities** - Address urgent alerts first
4. **Schedule Reviews** - Regular progress reviews

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Quick search |
| `Ctrl + N` | New message |
| `Ctrl + P` | Add patient |
| `Ctrl + /` | Show shortcuts |

## Troubleshooting

### Common Issues

**Patient can't register:**
- Check email was sent
- Verify PESEL format
- Ensure no duplicate account

**Tasks not appearing:**
- Check project is active
- Verify patient assignment
- Review task dates

**Reports not generating:**
- Check date range
- Verify data availability
- Try smaller date range

### Getting Help

**System Support:**
- Help Center: Click "?" icon
- Email: support@kptest.com
- Phone: +48 XXX XXX XXX

**Clinical Support:**
- Contact lead therapist
- Clinical supervisor

---

**Last Updated:** 2026-04-24
**Version:** 1.0.0
