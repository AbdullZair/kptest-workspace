# Dokumentacja Systemu KPTEST

Kompleksowa dokumentacja techniczna systemu telemedycznego KPTEST.

## 📁 Struktura Katalogów

```
docs/
├── api/                        # Dokumentacja API
├── architecture/               # Architektura systemu
├── decisions/                  # Architecture Decision Records (ADR)
├── setup/                      # Instrukcje konfiguracji
├── user-guides/               # Guides dla użytkowników
├── deployment/                 # Deployment guides
├── operations/                 # Operacje i utrzymanie
├── security/                   # Bezpieczeństwo
├── backup/                     # Backup i recovery
├── monitoring/                 # Monitoring
└── README.md                   # Ten plik
```

## 🔗 Szybkie Linki

### Dla Deweloperów

| Dokument | Opis |
|----------|------|
| [API Reference](./api/README.md) | Pełna dokumentacja endpointów |
| [Architecture Overview](./architecture/system-overview.md) | Przegląd architektury |
| [System Context (C4)](./architecture/system-context.md) | Diagram kontekstu systemu |
| [Container Diagram (C4)](./architecture/container.md) | Diagram kontenerów |
| [Component Diagram (C4)](./architecture/component.md) | Diagram komponentów |
| [Data Flow (DFD)](./architecture/data-flow.md) | Diagram przepływu danych |
| [Deployment (K8s)](./architecture/deployment.md) | Architektura Kubernetes |
| [Security Architecture](./architecture/security-architecture.md) | Architektura bezpieczeństwa |

### Dla DevOps

| Dokument | Opis |
|----------|------|
| [Staging Deployment](./deployment/staging-deployment.md) | Deployment na staging |
| [Production Deployment](./deployment/production-deployment.md) | Deployment na produkcję |
| [Rollback Procedure](./deployment/rollback-procedure.md) | Procedura rollback |
| [Blue-Green Deployment](./deployment/blue-green-deployment.md) | Blue-green deployment |
| [Monitoring Guide](./operations/monitoring.md) | Monitoring systemu |
| [Alerting Guide](./operations/alerting.md) | Konfiguracja alertów |
| [Troubleshooting](./operations/troubleshooting.md) | Rozwiązywanie problemów |
| [Maintenance](./operations/maintenance.md) | Procedury maintenance |
| [Scaling](./operations/scaling.md) | Skalowanie systemu |

### Dla Administratorów

| Dokument | Opis |
|----------|------|
| [Admin Guide](./user-guides/admin-guide.md) | Przewodnik administratora |
| [Backup Procedure](./setup/backup-procedure.md) | Procedury backup |
| [Disaster Recovery](./setup/disaster-recovery.md) | Disaster recovery |
| [HIS Integration](./setup/his-integration.md) | Integracja z HIS |
| [Email Provider Setup](./setup/email-provider-setup.md) | Konfiguracja email |
| [SMS Provider Setup](./setup/sms-provider-setup.md) | Konfiguracja SMS |

### Dla Użytkowników

| Dokument | Opis |
|----------|------|
| [Patient Guide](./user-guides/patient-guide.md) | Przewodnik pacjenta |
| [Coordinator Guide](./user-guides/coordinator-guide.md) | Przewodnik koordynatora |
| [Doctor Guide](./user-guides/doctor-guide.md) | Przewodnik lekarza |

## 📚 Pełny Indeks Dokumentacji

### API Documentation (12 plików)

| Plik | Opis |
|------|------|
| [README](./api/README.md) | Przegląd API |
| [authentication.md](./api/authentication.md) | Autentykacja i autoryzacja |
| [patients.md](./api/patients.md) | Zarządzanie pacjentami |
| [projects.md](./api/projects.md) | Zarządzanie projektami |
| [messages.md](./api/messages.md) | Komunikacja |
| [calendar.md](./api/calendar.md) | Kalendarz i wydarzenia |
| [materials.md](./api/materials.md) | Materiały edukacyjne |
| [admin.md](./api/admin.md) | Endpointy administracyjne |
| [reports.md](./api/reports.md) | Raporty i eksport |
| [audit.md](./api/audit.md) | Logi audytowe |
| [backup.md](./api/backup.md) | Zarządzanie backup |
| [email.md](./api/email.md) | Powiadomienia email |
| [sms.md](./api/sms.md) | Powiadomienia SMS |

### Architecture Documentation (10 plików)

| Plik | Opis |
|------|------|
| [README](./architecture/README.md) | Przegląd architektury |
| [system-overview.md](./architecture/system-overview.md) | Przegląd systemu |
| [system-context.md](./architecture/system-context.md) | C4 Level 1 - System Context |
| [container.md](./architecture/container.md) | C4 Level 2 - Container |
| [component.md](./architecture/component.md) | C4 Level 3 - Component |
| [data-flow.md](./architecture/data-flow.md) | Data Flow Diagram |
| [deployment.md](./architecture/deployment.md) | Kubernetes Deployment |
| [security-architecture.md](./architecture/security-architecture.md) | Architektura bezpieczeństwa |
| [data-model.md](./architecture/data-model.md) | Model danych |
| [sequence-diagrams.md](./architecture/sequence-diagrams.md) | Diagramy sekwencji |

### Architecture Decision Records (9 plików)

| Plik | Opis |
|------|------|
| [README](./decisions/README.md) | Przegląd ADR |
| [ADR-001](./decisions/ADR-001-authentication-strategy.md) | Strategia autentykacji |
| [ADR-002](./decisions/ADR-002-his-verification-workflow.md) | Workflow weryfikacji HIS |
| [ADR-003](./decisions/ADR-003-patient-project-assignment.md) | Przypisanie pacjentów do projektów |
| [ADR-004](./decisions/ADR-004-messaging-architecture.md) | Architektura komunikacji |
| [ADR-005](./decisions/ADR-005-database-choice.md) | Wybór bazy danych |
| [ADR-006](./decisions/ADR-006-authentication-strategy.md) | Strategia autentykacji JWT |
| [ADR-007](./decisions/ADR-007-microservices-vs-monolith.md) | Mikroserwisy vs Monolit |
| [ADR-008](./decisions/ADR-008-frontend-architecture.md) | Architektura frontend |
| [ADR-009](./decisions/ADR-009-mobile-architecture.md) | Architektura mobile |

### Setup Documentation (9 plików)

| Plik | Opis |
|------|------|
| [README](./setup/README.md) | Przegląd setup |
| [local-development.md](./setup/local-development.md) | Środowisko lokalne |
| [production-deployment.md](./setup/production-deployment.md) | Deployment produkcyjny |
| [testing-guide.md](./setup/testing-guide.md) | Przewodnik testowania |
| [his-integration.md](./setup/his-integration.md) | Integracja z HIS |
| [sms-provider-setup.md](./setup/sms-provider-setup.md) | Konfiguracja SMS |
| [email-provider-setup.md](./setup/email-provider-setup.md) | Konfiguracja email |
| [backup-procedure.md](./setup/backup-procedure.md) | Procedury backup |
| [disaster-recovery.md](./setup/disaster-recovery.md) | Disaster recovery |

### User Guides (4 pliki)

| Plik | Opis |
|------|------|
| [patient-guide.md](./user-guides/patient-guide.md) | Przewodnik pacjenta |
| [coordinator-guide.md](./user-guides/coordinator-guide.md) | Przewodnik koordynatora |
| [doctor-guide.md](./user-guides/doctor-guide.md) | Przewodnik lekarza |
| [admin-guide.md](./user-guides/admin-guide.md) | Przewodnik administratora |

### Deployment Documentation (4 pliki)

| Plik | Opis |
|------|------|
| [staging-deployment.md](./deployment/staging-deployment.md) | Deployment na staging |
| [production-deployment.md](./deployment/production-deployment.md) | Deployment na produkcję |
| [rollback-procedure.md](./deployment/rollback-procedure.md) | Procedura rollback |
| [blue-green-deployment.md](./deployment/blue-green-deployment.md) | Blue-green deployment |

### Operations Documentation (5 plików)

| Plik | Opis |
|------|------|
| [monitoring.md](./operations/monitoring.md) | Monitoring systemu |
| [alerting.md](./operations/alerting.md) | Konfiguracja alertów |
| [troubleshooting.md](./operations/troubleshooting.md) | Rozwiązywanie problemów |
| [maintenance.md](./operations/maintenance.md) | Procedury maintenance |
| [scaling.md](./operations/scaling.md) | Skalowanie systemu |

### Security Documentation

| Plik | Opis |
|------|------|
| [security-hardening.md](./security/security-hardening.md) | Hardening bezpieczeństwa |

### Backup Documentation

| Plik | Opis |
|------|------|
| [backup-procedure.md](./backup/backup-procedure.md) | Procedury backup |

### Monitoring Documentation

| Plik | Opis |
|------|------|
| [alerts.md](./monitoring/alerts.md) | Konfiguracja alertów |

## 👥 Role i Dostęp

| Rola | Opis | Dostęp |
|------|------|--------|
| **Administrator** | Zarządzanie systemem | Pełny dostęp |
| **Koordynator** | Koordynacja terapii | Zarządzanie pacjentami, projektami |
| **Lekarz/Terapeuta** | Prowadzenie terapii | Dostęp do pacjentów w projekcie |
| **Pacjent** | Uczestnik terapii | Aplikacja mobilna |

## 📊 Status Dokumentacji

| Sekcja | Liczba Plików | Status | Ostatnia aktualizacja |
|--------|---------------|--------|----------------------|
| API | 13 | ✅ Complete | 2026-04-24 |
| Architecture | 10 | ✅ Complete | 2026-04-24 |
| Decisions (ADR) | 9 | ✅ Complete | 2026-04-24 |
| Setup | 9 | ✅ Complete | 2026-04-24 |
| User Guides | 4 | ✅ Complete | 2026-04-24 |
| Deployment | 4 | ✅ Complete | 2026-04-24 |
| Operations | 5 | ✅ Complete | 2026-04-24 |
| Security | 1 | ✅ Complete | 2026-04-24 |
| Backup | 1 | ✅ Complete | 2026-04-24 |
| Monitoring | 1 | ✅ Complete | 2026-04-24 |
| **RAZEM** | **57** | ✅ **Complete** | 2026-04-24 |

## 🔍 Wyszukiwanie

### Przez Przeglądarkę

Użyj funkcji wyszukiwania przeglądarki (`Ctrl+F` / `Cmd+F`) aby znaleźć:
- Nazwy endpointów API
- Nazwy komponentów
- Komendy kubectl
- Komunikaty o błędach

### Przez GitHub

```
site:github.com/AbdullZair/kptest-workspace/docs "szukana fraza"
```

## 📞 Kontakt i Wsparcie

| Typ | Kontakt |
|-----|---------|
| Technical Support | support@kptest.com |
| Security Issues | security@kptest.com |
| Documentation Feedback | docs@kptest.com |

## 📝 Contributing

Aby zaproponować zmiany w dokumentacji:
1. Stwórz branch z nazwą `docs/<temat>`
2. Wprowadź zmiany
3. Stwórz Pull Request
4. Oczekuj na review

---

**KPTEST Team** © 2026

*Ostatnia aktualizacja: 2026-04-24*
*Wersja dokumentacji: 1.0.0*
