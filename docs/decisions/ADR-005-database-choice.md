# ADR-005: Database Choice

## Status

ACCEPTED

## Date

2025-10-15

## Context

The KPTEST telemedicine system requires a robust, scalable, and compliant database solution for storing:
- Patient records (including sensitive medical data)
- Therapeutic project data
- Message threads and attachments
- Calendar events
- Audit logs (10-year retention requirement)
- User accounts and authentication data

Key requirements:
1. **ACID compliance** - Critical for medical data integrity
2. **Data integrity** - Foreign keys, constraints, transactions
3. **Query complexity** - Complex joins for reporting
4. **Compliance** - RODO/GDPR, HIPAA considerations
5. **Scalability** - Support for 10,000+ patients
6. **Reliability** - High availability, backup/restore
7. **Ecosystem** - Spring Boot integration, tooling

## Decision

We will use **PostgreSQL 15** as the primary database for the KPTEST system.

### Rationale

| Criterion | PostgreSQL | MySQL | MongoDB |
|-----------|------------|-------|---------|
| ACID Compliance | ✅ Full | ✅ Full | ⚠️ Limited |
| Complex Queries | ✅ Excellent | ⚠️ Good | ❌ Limited |
| JSON Support | ✅ Good | ⚠️ Basic | ✅ Excellent |
| Full-Text Search | ✅ Built-in | ⚠️ Basic | ✅ Good |
| Spring Boot Integration | ✅ Excellent | ✅ Excellent | ✅ Good |
| Compliance Features | ✅ RLS, Audit | ⚠️ Basic | ⚠️ Basic |
| Geographic Support | ✅ PostGIS | ⚠️ Basic | ✅ Good |
| Community/Enterprise | ✅ Strong | ✅ Strong | ✅ Strong |

### Selected Features

1. **Row-Level Security (RLS)**
   - Fine-grained access control
   - Patient data isolation by project
   - Compliance with least-privilege principle

2. **JSONB Support**
   - Flexible schema for emergency contacts
   - Semi-structured audit log details
   - Configuration storage

3. **Full-Text Search**
   - Patient search by name
   - Message content search
   - Material search

4. **Advanced Indexing**
   - B-tree for standard queries
   - GIN for JSONB and full-text
   - Partial indexes for filtered queries

5. **Logical Replication**
   - Read replicas for reporting
   - Zero-downtime migrations
   - Backup strategies

### Schema Design

```sql
-- Core schema
CREATE SCHEMA kptest;

-- Example: Patients table with RLS
CREATE TABLE kptest.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pesel VARCHAR(11) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    emergency_contact JSONB,
    his_verified BOOLEAN DEFAULT FALSE,
    his_verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_patients_last_name ON kptest.patients(last_name);
CREATE INDEX idx_patients_email ON kptest.patients(email);
CREATE INDEX idx_patients_pesel ON kptest.patients(pesel);
CREATE INDEX idx_patients_his_verified ON kptest.patients(his_verified);

-- Row-Level Security
ALTER TABLE kptest.patients ENABLE ROW LEVEL SECURITY;

-- Policy: Coordinators see all patients
CREATE POLICY coordinators_all_patients ON kptest.patients
    FOR ALL TO coordinators USING (true);

-- Policy: Therapists see only assigned patients
CREATE POLICY therapists_assigned_patients ON kptest.patients
    FOR ALL TO therapists USING (
        EXISTS (
            SELECT 1 FROM kptest.patient_projects pp
            JOIN kptest.projects p ON pp.project_id = p.id
            WHERE pp.patient_id = id AND p.therapist_id = current_setting('app.current_user_id')::UUID
        )
    );
```

## Consequences

### Positive

1. **Data Integrity** - Strong typing, constraints, and transactions ensure data consistency
2. **Query Performance** - Advanced query planner, multiple index types
3. **Compliance Ready** - RLS, audit extensions, encryption support
4. **Spring Boot Integration** - Excellent JPA/Hibernate support
5. **Scalability** - Connection pooling, read replicas, partitioning support
6. **Extensibility** - Custom types, functions, extensions (PostGIS, pgcrypto)

### Negative

1. **Complexity** - More complex than simpler databases
2. **Resource Usage** - Higher memory footprint than SQLite
3. **Learning Curve** - Advanced features require expertise

### Migration Path

If migration is needed:
- MySQL: Compatible SQL dialect, schema conversion required
- MongoDB: Significant rewrite needed (relational → document)

## Compliance Notes

### RODO/GDPR

- **Data minimization**: Only necessary fields stored
- **Purpose limitation**: Clear schema documentation
- **Storage limitation**: Automated retention policies
- **Right to erasure**: Soft delete with audit trail
- **Data portability**: Export endpoints (CSV, JSON)

### HIPAA Considerations

- **Encryption**: TDE, column-level encryption for sensitive data
- **Access controls**: RLS, role-based permissions
- **Audit trail**: All data access logged
- **Backup encryption**: Encrypted backups with key management

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/15/)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Flyway Migrations](https://flywaydb.org/)
- [HikariCP Connection Pooling](https://github.com/brettwooldridge/HikariCP)

---

**Authors:** KPTEST Architect Agent
**Reviewers:** Backend Team, DevOps Team
