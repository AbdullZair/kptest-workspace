# ADR-004: Messaging Architecture

**Date:** 2024-02-15  
**Status:** Accepted  
**Authors:** KPTEST Development Team  
**Reviewers:** Technical Architecture Board

## Context

The KPTEST system requires a robust messaging system to facilitate communication between patients and medical staff within therapeutic projects. The messaging system must support:

- Individual conversations (patient ↔ staff)
- Group conversations (staff → multiple patients)
- File attachments (up to 10MB per file)
- Message status tracking (sent, delivered, read)
- Priority levels (LOW, NORMAL, HIGH, URGENT)
- Thread-based organization per project
- Real-time notifications
- Compliance with healthcare data retention requirements

## Decision

We have decided to implement a **thread-based messaging architecture with stored messages** rather than an event-sourcing approach.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Messaging System                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Message    │    │    Thread    │    │  Attachment  │       │
│  │   Service    │    │    Service   │    │   Service    │       │
│  │              │    │              │    │              │       │
│  │ - send       │    │ - create     │    │ - upload     │       │
│  │ - get        │    │ - get        │    │ - download   │       │
│  │ - markRead   │    │ - participants│   │ - delete     │       │
│  │ - search     │    │ - archive    │    │              │       │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
│         │                   │                   │                │
│         └───────────────────┼───────────────────┘                │
│                             │                                     │
│                    ┌────────▼────────┐                           │
│                    │  MessageFacade  │                           │
│                    │                 │                           │
│                    │ - validate      │                           │
│                    │ - authorize     │                           │
│                    │ - notify        │                           │
│                    └────────┬────────┘                           │
│                             │                                     │
│         ┌───────────────────┼───────────────────┐                │
│         │                   │                   │                │
│  ┌──────▼───────┐   ┌───────▼───────┐   ┌──────▼───────┐        │
│  │  PostgreSQL  │   │    Redis      │   │ File Storage │        │
│  │  (Messages)  │   │   (Cache)     │   │   (S3)       │        │
│  └──────────────┘   └───────────────┘   └──────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Core Design Decisions

#### 1. Thread-Based Organization

**Decision:** Messages are organized into threads, where each thread represents a conversation context.

**Rationale:**
- Threads provide natural conversation grouping
- Easier to manage permissions at thread level
- Supports both 1:1 and group conversations
- Simplifies UI implementation (conversation list pattern)

**Implementation:**
```java
@Entity
@Table(name = "message_threads")
public class MessageThread {
    @Id
    private UUID id;
    
    @Enumerated(EnumType.STRING)
    private ThreadType type;  // INDIVIDUAL or GROUP
    
    private UUID projectId;
    private String title;
    
    @OneToMany(mappedBy = "thread")
    private List<Message> messages;
    
    @ManyToMany
    private Set<User> participants;
}
```

#### 2. Stored Messages (Not Event Sourcing)

**Decision:** Messages are stored as complete entities in PostgreSQL rather than using event sourcing.

**Rationale:**
- **Simplicity**: CRUD operations are straightforward and well-understood
- **Query Performance**: Easy to query message history, search content, filter by status
- **Compliance**: Healthcare regulations require immutable audit trails - achieved through soft deletes and audit logging
- **Read Patterns**: Most operations are reads (fetching conversation history), which are optimized in relational storage
- **Team Expertise**: Team has more experience with traditional persistence

**Trade-offs Accepted:**
- Lost ability to replay message events for analytics
- More complex to implement message editing/revision history
- State mutations must be carefully managed

**Implementation:**
```java
@Entity
@Table(name = "messages")
public class Message {
    @Id
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "thread_id")
    private MessageThread thread;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;
    
    @Enumerated(EnumType.STRING)
    private MessagePriority priority;
    
    private Instant sentAt;
    private Instant deliveredAt;
    
    @OneToMany(mappedBy = "message")
    private List<MessageReadReceipt> readReceipts;
}
```

#### 3. Read Receipts as Separate Entities

**Decision:** Read status is tracked via separate `MessageReadReceipt` entities rather than a boolean flag on the message.

**Rationale:**
- Supports multiple readers per message (group conversations)
- Tracks exact read timestamp per user
- Enables "read by" lists in UI
- More scalable for large group conversations

**Implementation:**
```java
@Entity
@Table(name = "message_read_receipts")
public class MessageReadReceipt {
    @Id
    private UUID id;
    
    @ManyToOne
    private Message message;
    
    @ManyToOne
    private User reader;
    
    private Instant readAt;
}
```

#### 4. Attachments as Separate Aggregates

**Decision:** File attachments are stored as separate entities linked to messages, with files stored in S3-compatible object storage.

**Rationale:**
- Decouples file lifecycle from message lifecycle
- Enables attachment sharing across messages (future feature)
- Better storage efficiency (deduplication possible)
- Independent backup/retention policies for files

**Implementation:**
```java
@Entity
@Table(name = "message_attachments")
public class MessageAttachment {
    @Id
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "message_id")
    private Message message;
    
    private String fileName;
    private Long fileSize;
    private String mimeType;
    private String storageUrl;
    
    private Instant uploadedAt;
}
```

#### 5. Synchronous Send with Async Notification

**Decision:** Message sending is synchronous (returns message immediately), but notifications are sent asynchronously.

**Rationale:**
- User gets immediate feedback that message was sent
- Notification delivery failures don't block message send
- Better UX with optimistic UI updates
- Notifications can be retried independently

**Implementation:**
```java
@Transactional
public MessageDto sendMessage(UUID threadId, SendMessageRequest request, UUID senderId) {
    // Synchronous: Create and persist message
    Message message = createMessage(threadId, request, senderId);
    messageRepository.save(message);
    
    // Async: Send notifications
    notificationService.sendAsync(
        message.getThreadId(),
        message.getId(),
        NotificationType.NEW_MESSAGE
    );
    
    return messageMapper.toDto(message);
}
```

## Consequences

### Positive

1. **Simplicity**: The architecture is straightforward to implement and maintain
2. **Performance**: Read-heavy workloads are well-optimized with proper indexing
3. **Compliance**: Full audit trail through soft deletes and immutable timestamps
4. **Scalability**: Thread-based partitioning allows horizontal scaling
5. **Flexibility**: Easy to add features like message reactions, edits, or threads within threads

### Negative

1. **Storage Growth**: Message history grows unbounded - requires archival strategy
2. **Search Complexity**: Full-text search across messages requires additional infrastructure (Elasticsearch)
3. **Real-time Updates**: Requires WebSocket or polling for real-time message delivery
4. **No Event Replay**: Cannot reconstruct state from events for debugging or analytics

### Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database grows too large | High | Medium | Implement message archival after 2 years; partition tables by date |
| Real-time delivery latency | Medium | High | Use WebSocket connections; fallback to polling |
| File storage costs | Medium | Medium | Implement attachment compression; set retention policies |
| Notification delivery failures | Low | Medium | Retry with exponential backoff; queue notifications |

## Alternatives Considered

### Alternative 1: Event Sourcing

**Approach:** Store all message events (Created, Delivered, Read, Edited, Deleted) as immutable events.

**Pros:**
- Complete audit trail by design
- Can replay events for analytics
- Easy to add new projections

**Cons:**
- Complex implementation
- Higher storage requirements
- Steep learning curve for team
- Overkill for our use case

**Why Rejected:** Complexity outweighs benefits for our requirements. We can achieve compliance through audit logging.

### Alternative 2: NoSQL Document Store

**Approach:** Use MongoDB or similar for message storage with embedded conversations.

**Pros:**
- Flexible schema
- Good for hierarchical data
- Horizontal scaling

**Cons:**
- Loses transactional guarantees
- Complex queries for read receipts
- Team less experienced with NoSQL

**Why Rejected:** We need ACID guarantees for compliance; team expertise is in relational databases.

### Alternative 3: Chat Service (External)

**Approach:** Use a third-party chat service (Sendbird, Stream, Twilio Conversations).

**Pros:**
- Fast implementation
- Built-in features (typing indicators, reactions)
- Managed infrastructure

**Cons:**
- Data residency concerns (GDPR/RODO)
- Vendor lock-in
- Limited customization
- Ongoing costs

**Why Rejected:** Healthcare data must remain in our controlled infrastructure; customization requirements are specific.

## Compliance Considerations

### RODO/GDPR

- Messages contain personal data - must be encrypted at rest (AES-256)
- Right to erasure: Implement soft delete with anonymization after retention period
- Data portability: Export conversations in machine-readable format

### Healthcare Regulations

- Audit trail: All message operations logged with timestamp and user
- Access control: Role-based access to conversations
- Retention: Messages retained for 10 years per healthcare regulations

## Implementation Guidelines

### Database Schema

```sql
CREATE TABLE message_threads (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id),
    type VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE message_thread_participants (
    thread_id UUID REFERENCES message_threads(id),
    user_id UUID REFERENCES users(id),
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (thread_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY,
    thread_id UUID NOT NULL REFERENCES message_threads(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE message_read_receipts (
    id UUID PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES messages(id),
    user_id UUID NOT NULL REFERENCES users(id),
    read_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

CREATE TABLE message_attachments (
    id UUID PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES messages(id),
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_url VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX idx_read_receipts_user_id ON message_read_receipts(user_id);
CREATE INDEX idx_threads_project_id ON message_threads(project_id);
```

### API Design

```
# Threads
GET    /api/v1/messages/threads           # List threads
POST   /api/v1/messages/threads           # Create thread
GET    /api/v1/messages/threads/{id}      # Get thread details

# Messages
GET    /api/v1/messages/threads/{id}/messages     # Get messages in thread
POST   /api/v1/messages/threads/{id}/messages     # Send message
POST   /api/v1/messages/messages/{id}/read        # Mark as read

# Attachments
POST   /api/v1/messages/messages/{id}/attachments # Upload attachment
GET    /api/v1/messages/attachments/{id}          # Download attachment
```

## References

- [ADR-001: Authentication Strategy](./ADR-001-authentication-strategy.md)
- [ADR-002: HIS Verification Workflow](./ADR-002-his-verification-workflow.md)
- [Messages API Documentation](../api/messages.md)
- [System Overview](../architecture/system-overview.md)
