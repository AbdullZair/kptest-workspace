# ADR-010: RODO Compliance Implementation

## Status
ACCEPTED (2026-04-27)

## Context
System KPTESTPRO musi spełniać wymagania RODO (Rozporządzenie o Ochronie Danych Osobowych) dla systemu medycznego:

- **Art. 17** - Prawo do bycia zapomnianym (right to erasure)
- **Art. 20** - Prawo do przenoszenia danych (right to data portability)
- **Art. 30** - Rejestr czynności przetwarzania (record of processing activities)

Wymagania wynikają z:
- Specyfikacji projektu (FAZA 1 - backend RODO)
- Wymagań prawnych dla systemów przetwarzających dane zdrowotne
- Potrzeby zapewnienia compliance przed wdrożeniem production

## Decision

Zaimplementowano 4 endpointy RODO w backendzie:

### 1. Anonimizacja pacjenta (US-A-10)
```
POST /api/v1/admin/patients/{id}/anonymize
```
- Zastępuje dane PII wartościami anonimizowanymi
- Zachowuje `id`, powiązania projektowe, audit log
- Audit: `AuditLog` z `action=ANONYMIZE`

### 2. Eksport danych pacjenta (US-A-11)
```
GET /api/v1/admin/patients/{id}/export-data?format=json|pdf
```
- Eksportuje wszystkie dane pacjenta w formacie JSON lub PDF
- Zawiera: dane osobowe, projekty, wiadomości, materiały, zdarzenia, quiz attempts, badges, audit log

### 3. Erasure pacjenta (US-A-12)
```
DELETE /api/v1/admin/patients/{id}/erase
```
- Hard-delete po 30-dniowym cooling period
- Usuwa: `PatientBadge`, `MaterialProgress`, `QuizAnswerSelection`, `QuizAttempt`, `MessageAttachment`, `Notification`, `EmergencyContact`
- Anonimizuje powiązania w `Message` i `AuditLog`
- Zapisuje `DataProcessingErasureLog`

### 4. Rejestr czynności przetwarzania (US-A-13)
```
GET|POST|PUT|DELETE /api/v1/admin/data-processing-activities
```
- Nowa encja: `DataProcessingActivity`
- CRUD dla rejestru czynności przetwarzania
- Pola: name, purpose, legalBasis, categories, recipients, retentionPeriod, securityMeasures, dataController, dataProcessor

## Alternatives Considered

### Opcja 1: Tylko anonimizacja (bez erasure)
- **Odrzucona:** RODO Art. 17 wymaga możliwości trwałego usunięcia danych w określonych przypadkach

### Opcja 2: Erasure natychmiastowe (bez cooling period)
- **Odrzucona:** 30-dniowy cooling period pozwala na przywrócenie danych w przypadku błędu lub cofnięcia żądania

### Opcja 3: Rejestr czynności w osobnym systemie
- **Odrzucona:** Integralność z systemem zapewnia lepszy audit trail i easier maintenance

## Consequences

### Pozytywne
- ✅ **Compliance z RODO** - system spełnia wymagania Art. 17, 20, 30
- ✅ **Audit trail** - wszystkie operacje RODO są logowane w `AuditLog` i `DataProcessingErasureLog`
- ✅ **Eksport danych** - pacjenci mogą otrzymać kopię swoich danych w formacie JSON/PDF
- ✅ **Elastyczność** - cooling period pozwala na odwracalność operacji erasure

### Negatywne / Ryzyka
- ⚠️ **30-day cooling period** - opóźnienie w ostatecznym usunięciu danych (wymagane przez compliance)
- ⚠️ **Złożoność implementacji** - wiele encji do usunięcia/anonimizacji przy erasure
- ⚠️ **Testowanie** - wymaga kompleksowych testów integracyjnych dla weryfikacji poprawności usuwania

## Implementation Details

### Backend
- `AdminController` + `AdminService` - anonimizacja, eksport, erasure
- `DataProcessingController` - CRUD dla rejestru czynności
- `DataProcessingActivity` - nowa encja w `domain/audit/`
- `DataProcessingErasureLog` - encja do logowania erasure
- Migracja Flyway: `V2__data_processing_registry.sql`

### Security
- Wszystkie endpointy: `@PreAuthorize("hasRole('ADMIN')")`
- Bean Validation dla DTO
- `GlobalExceptionHandler` dla error handling

### Frontend (FAZA 2)
- `PatientDataAdminPage` - UI z tabs: View | Anonymize | Export | Erase | Audit Trail
- `DataProcessingActivitiesPage` - lista i CRUD dla czynności przetwarzania

## Compliance Mapping

| Wymaganie RODO | Implementacja | User Story |
|----------------|---------------|------------|
| Art. 17 - Erasure | `DELETE /patients/{id}/erase` | US-A-12 |
| Art. 17 - Anonymization | `POST /patients/{id}/anonymize` | US-A-10 |
| Art. 20 - Data portability | `GET /patients/{id}/export-data` | US-A-11 |
| Art. 30 - Processing registry | `GET|POST|PUT|DELETE /data-processing-activities` | US-A-13 |

---

**Autor:** Technical Writer (kpt-dokumentalista)  
**Data:** 2026-04-27
