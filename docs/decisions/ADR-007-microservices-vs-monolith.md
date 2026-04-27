# ADR-007: Microservices vs Monolith

## Status

ACCEPTED

## Date

2025-10-25

## Context

The KPTEST telemedicine system needs an architectural style that balances:
- Development speed and simplicity
- Scalability requirements
- Team organization
- Operational complexity
- Future growth potential

Key considerations:
1. **Team Size** - Small team (5-6 developers)
2. **Timeline** - 12-week project duration
3. **Scale** - Expected 10,000+ patients, 500+ concurrent users
4. **Complexity** - Multiple domains (patients, projects, messaging, reporting)
5. **Deployment** - Kubernetes infrastructure available
6. **Maintenance** - Long-term support expected

## Decision

We will implement a **Modular Monolith** architecture with clear domain boundaries, designed for potential future extraction to microservices.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Modular Monolith Architecture                        │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      API Gateway (Spring Boot)                       │    │
│  │                                                                       │    │
│  │  • Authentication & Authorization                                     │    │
│  │  • Rate Limiting                                                     │    │
│  │  • Request Routing                                                   │    │
│  │  • API Versioning                                                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Application Layer                               │    │
│  │                                                                       │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │   Patient    │  │   Project    │  │ Communication│               │    │
│  │  │   Module     │  │   Module     │  │   Module     │               │    │
│  │  │              │  │              │  │              │               │    │
│  │  │ • Controller │  │ • Controller │  │ • Controller │               │    │
│  │  │ • Service    │  │ • Service    │  │ • Service    │               │    │
│  │  │ • Repository │  │ • Repository │  │ • Repository │               │    │
│  │  │ • DTO        │  │ • DTO        │  │ • DTO        │               │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │    │
│  │                                                                       │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │   Calendar   │  │  Education   │  │    Report    │               │    │
│  │  │   Module     │  │   Module     │  │   Module     │               │    │
│  │  │              │  │              │  │              │               │    │
│  │  │ • Controller │  │ • Controller │  │ • Controller │               │    │
│  │  │ • Service    │  │ • Service    │  │ • Service    │               │    │
│  │  │ • Repository │  │ • Repository │  │ • Repository │               │    │
│  │  │ • DTO        │  │ • DTO        │  │ • DTO        │               │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │    │
│  │                                                                       │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │    Audit     │  │   Backup     │ │     Auth     │                │    │
│  │  │   Module     │  │   Module     │ │    Module    │                │    │
│  │  │              │  │              │ │              │                │    │
│  │  │ • Controller │  │ • Controller │ │ • Controller │                │    │
│  │  │ • Service    │  │ • Service    │ │ • Service    │                │    │
│  │  │ • Repository │  │ • Repository │ │ • Repository │                │    │
│  │  │ • Entity     │  │ • Entity     │ │ • Entity     │                │    │
│  │  └──────────────┘  └──────────────┘ └──────────────┘                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Shared Kernel                                   │    │
│  │                                                                       │    │
│  │  • Common DTOs           • Utilities           • Events              │    │
│  │  • Base Entities         • Exceptions          • Config              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Data Layer                                      │    │
│  │                                                                       │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │  PostgreSQL  │  │    Redis     │  │ File Storage │               │    │
│  │  │  (Primary)   │  │   (Cache)    │  │    (S3)      │               │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Module Structure

```
backend/
├── src/main/java/com/kptest/backend/
│   ├── common/                    # Shared kernel
│   │   ├── dto/
│   │   ├── exception/
│   │   ├── util/
│   │   └── config/
│   │
│   ├── module/
│   │   ├── auth/                  # Authentication module
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── entity/
│   │   │   └── dto/
│   │   │
│   │   ├── patient/               # Patient module
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── entity/
│   │   │   └── dto/
│   │   │
│   │   ├── project/               # Project module
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── entity/
│   │   │   └── dto/
│   │   │
│   │   ├── communication/         # Messaging module
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── entity/
│   │   │   └── dto/
│   │   │
│   │   ├── calendar/              # Calendar module
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── entity/
│   │   │   └── dto/
│   │   │
│   │   ├── education/             # Education module
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── entity/
│   │   │   └── dto/
│   │   │
│   │   ├── report/                # Report module
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── entity/
│   │   │   └── dto/
│   │   │
│   │   ├── audit/                 # Audit module
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── entity/
│   │   │   └── dto/
│   │   │
│   │   └── backup/                # Backup module
│   │       ├── controller/
│   │       ├── service/
│   │       ├── repository/
│   │       ├── entity/
│   │       └── dto/
│   │
│   └── BackendApplication.java
```

### Module Communication

#### Within Monolith (Direct Method Calls)

```java
@Service
public class PatientService {
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private ProjectService projectService;  // Direct call
    
    @Autowired
    private NotificationService notificationService;  // Direct call
    
    public Patient assignToProject(UUID patientId, UUID projectId) {
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new PatientNotFoundException(patientId));
        
        // Direct method call to another module's service
        projectService.addPatient(projectId, patientId);
        
        // Direct method call to notification module
        notificationService.sendProjectAssignmentNotification(patient);
        
        return patientRepository.save(patient);
    }
}
```

#### Event-Driven (For Loose Coupling)

```java
// Event definition
public class PatientAssignedToProjectEvent extends ApplicationEvent {
    private final UUID patientId;
    private final UUID projectId;
    private final UUID coordinatorId;
    
    public PatientAssignedToProjectEvent(Object source, UUID patientId, 
                                          UUID projectId, UUID coordinatorId) {
        super(source);
        this.patientId = patientId;
        this.projectId = projectId;
        this.coordinatorId = coordinatorId;
    }
    
    // Getters...
}

// Event publisher
@Service
public class PatientService {
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    public Patient assignToProject(UUID patientId, UUID projectId) {
        // ... assignment logic
        
        eventPublisher.publishEvent(
            new PatientAssignedToProjectEvent(this, patientId, projectId, userId)
        );
        
        return patient;
    }
}

// Event listener (in different module)
@Service
public class NotificationEventListener {
    
    @Autowired
    private NotificationService notificationService;
    
    @EventListener
    public void handlePatientAssigned(PatientAssignedToProjectEvent event) {
        notificationService.sendProjectAssignmentNotification(
            event.getPatientId(),
            event.getProjectId()
        );
    }
}
```

## Consequences

### Positive

1. **Simplicity** - Single codebase, easier development
2. **Performance** - No network overhead for internal calls
3. **Consistency** - ACID transactions across modules
4. **Debugging** - Easier to trace and debug
5. **Deployment** - Single deployment artifact
6. **Team Efficiency** - No distributed system complexity
7. **Future Extraction** - Clear module boundaries enable microservices later

### Negative

1. **Coupling** - Potential for module coupling over time
2. **Scaling** - Must scale entire application
3. **Code Size** - Growing codebase can become unwieldy
4. **Technology Lock** - Single technology stack

### Mitigation Strategies

| Risk | Mitigation |
|------|------------|
| Module coupling | Enforce module boundaries with ArchUnit tests |
| Code growth | Regular refactoring, clear ownership |
| Scaling limits | Design stateless services, horizontal scaling |
| Future extraction | Use domain events, avoid direct DB access across modules |

## Module Boundary Enforcement

### ArchUnit Tests

```java
@AnalyzeClasses(packages = "com.kptest.backend")
class ModuleArchitectureTest {
    
    @ArchTest
    static final ArchRule patient_module_should_not_access_project_controller =
        noClasses()
            .that().resideInAPackage("..module.patient..")
            .should().accessClassesThat().resideInAPackage("..module.project.controller..");
    
    @ArchTest
    static final ArchRule modules_should_only_communicate_via_services =
        noClasses()
            .that().resideInAPackage("..module..controller..")
            .should().accessClassesThat().resideInAPackage("..module..repository..");
    
    @ArchTest
    static final ArchRule repository_should_only_access_own_entity =
        classes()
            .that().resideInAPackage("..module.patient.repository..")
            .should().onlyAccessClassesThat().resideInAnyPackage(
                "..module.patient.entity..",
                "..module.patient.repository..",
                "java..",
                "org.springframework.."
            );
}
```

## Scaling Strategy

### Horizontal Scaling

```yaml
# Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kptest-backend
spec:
  replicas: 5  # Scale entire monolith
  template:
    spec:
      containers:
      - name: backend
        image: kptest/backend:latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

### Database Scaling

- Read replicas for reporting queries
- Connection pooling (HikariCP)
- Query optimization and indexing
- Caching layer (Redis)

## Migration Path to Microservices

If scaling requires microservices:

```
Phase 1: Identify candidates
  └── High-traffic modules (Messaging, Notifications)
  
Phase 2: Extract with strangler pattern
  └── Create new service, route traffic gradually
  
Phase 3: Data separation
  └── Separate database schemas per service
  
Phase 4: Full microservices
  └── Independent deployment, service mesh
```

## Alternatives Considered

### Full Microservices

**Pros:**
- Independent scaling
- Technology diversity
- Fault isolation

**Cons:**
- Operational complexity
- Network latency
- Distributed transactions
- Team overhead

**Decision:** Too complex for current team size and timeline

### Serverless

**Pros:**
- Auto-scaling
- Pay-per-use
- No infrastructure management

**Cons:**
- Cold starts
- Vendor lock-in
- Debugging complexity
- Cost at scale

**Decision:** Not suitable for stateful, long-running processes

---

**Authors:** KPTEST Architect Agent
**Reviewers:** Backend Team, DevOps Team
