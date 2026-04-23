---
name: Patient-Project Assignment Model
description: Model przypisywania pacjentów do projektów z walidacją HIS
type: decision
---

# ADR-003: Model Przypisywania Pacjentów do Projektów

## Status
**PROPOSED** - 2026-04-23

## Kontekst

System musi obsługiwać przypisywanie pacjentów do projektów terapeutycznych zgodnie z wymaganiami:

- `ww.20` - Przypisanie do jednego lub wielu projektów
- `ww.21` - Przypisanie indywidualne lub grupowe (import z listy)
- `ww.22` - Walidacja istnienia pacjenta w HIS przed przypisaniem
- `ww.23` - Usunięcie pacjenta z projektu z podaniem przyczyny
- `ww.24` - Zachowanie historii przypisań
- `ww.25` - Powiadomienie pacjenta o przypisaniu
- `ww.26` - Przenoszenie pacjenta między projektami

Kluczowe decyzje do podjęcia:
1. Czy pacjent może być w wielu aktywnych projektach jednocześnie?
2. Jak obsługiwać historię przypisań?
3. Czy walidacja HIS jest wymagana przy każdym przypisaniu?

## Decyzja

**Wybrano: Model wielu projektów z encją pośredniczącą `PatientProject`**

### Model danych

```
┌─────────────┐       ┌───────────────────┐       ┌─────────────┐
│   Patient   │──────<│  PatientProject   │>──────│   Project   │
└─────────────┘   1:* └───────────────────┘   *:< └─────────────┘
                      - id (UUID)
                      - patient_id (FK)
                      - project_id (FK)
                      - enrolled_at (timestamp)
                      - left_at (nullable timestamp)
                      - removal_reason (nullable)
                      - removed_by (FK to Staff)
                      - current_stage (enum)
                      - compliance_score (computed)
```

### Encja PatientProject

```java
@Entity
@Table(name = "patient_projects", 
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"patient_id", "project_id", "left_at"}
       ))
public class PatientProject {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @Column(name = "enrolled_at", nullable = false)
    private Instant enrolledAt;
    
    @Column(name = "left_at")
    private Instant leftAt;  // null = nadal aktywny
    
    @Column(name = "removal_reason")
    private String removalReason;  // wymagane przy usuwaniu
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "removed_by")
    private Staff removedBy;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "current_stage", nullable = false)
    private TherapyStage currentStage = TherapyStage.NOT_STARTED;
    
    // Metody biznesowe
    public void complete() {
        this.currentStage = TherapyStage.COMPLETED;
    }
    
    public void remove(Staff remover, String reason) {
        this.leftAt = Instant.now();
        this.removedBy = remover;
        this.removalReason = reason;
        this.currentStage = TherapyStage.REMOVED;
    }
    
    public boolean isActive() {
        return leftAt == null;
    }
}

public enum TherapyStage {
    NOT_STARTED,
    IN_PROGRESS,
    COMPLETED,
    REMOVED
}
```

### Flow przypisania indywidualnego

```
Koordynator w portalu:
1. Wyszukaj pacjenta (PESEL/imie+nazwisko/HIS ID)
2. Wybierz pacjenta z wyników
3. Kliknij "Przypisz do projektu"
4. Wybierz projekt z listy aktywnych
5. System waliduje:
   - Czy pacjent ma status ACTIVE (zweryfikowany w HIS)
   - Czy pacjent nie jest już przypisany do tego projektu
   - (Opcjonalnie) Czy projekt ma wolne miejsca
6. Jeśli walidacja OK → utwórz PatientProject
7. Wyślij powiadomienie email/push do pacjenta
8. Zaloguj audyt: "Staff X przypisał Pacjenta Y do Projektu Z"
```

### Flow przypisania grupowego

```
Koordynator w portalu:
1. Wejdź w szczegóły projektu
2. Kliknij "Przypisz pacjentów grupowo"
3. Opcje:
   a) Wgraj plik CSV/Excel z listą PESEL
   b) Wybierz z listy pacjentów (checkbox)
   c) Wklej listę PESEL (textarea)
4. System waliduje każdego pacjenta:
   - Czy istnieje w HIS
   - Czy ma ACTIVE status
   - Czy nie jest już w projekcie
5. Podsumowanie: 
   - 15 pacjentów zostanie przypisanych
   - 2 pacjentów pominiętych (już w projekcie)
6. Potwierdź
7. Masowe utworzenie PatientProject + powiadomienia
```

### Walidacja HIS

**Zdecydowano:** Walidacja HIS tylko przy pierwszej rejestracji pacjenta, NIE przy każdym przypisaniu.

**Uzasadnienie:**
- Wymaganie `ww.22` mówi o walidacji "przed przypisaniem" - interpretujemy to jako "przed pierwszym przypisaniem"
- Jeśli pacjent jest już `ACTIVE` w systemie, oznacza to że przeszedł weryfikację
- Dodatkowe odpytania HIS generują niepotrzebny ruch i ryzyko (awaria HIS nie blokuje przypisań)
- Zgodne z `ww-nf-int.04` - system działa niezależnie od HIS po weryfikacji

## Alternatywy

### Opcja 1: Pojedynczy projekt na pacjenta
**Odrzucona ponieważ:**
- Specyfikacja (`ww.20`) wyraźnie mówi "jednego lub wielu projektów"
- Ograniczałoby to scenariusze kliniczne (pacjent w wielu terapiach)

### Opcja 2: Walidacja HIS przy każdym przypisaniu
**Odrzucona ponieważ:**
- Ryzyko awarii HIS blokującej przypisania
- Niepotrzebne obciążenie systemu HIS
- Wystarczy status `ACTIVE` pacjenta jako dowód weryfikacji

### Opcja 3: Soft delete vs hard delete
**Zdecydowano:** Soft delete z `left_at` i `removal_reason`
- Zachowuje pełną historię (wymaganie `ww.24`)
- Umożliwia raportowanie historyczne
- Pozwala na przywrócenie pacjenta (cofnięcie `left_at`)

## Konsekwencje

### ✅ Pozytywne
- **Elastyczność** - pacjent w wielu projektach
- **Historia** - pełny audyt przypisań
- **Powiadomienia** - pacjent wie o przypisaniu
- **Compliance** - zgodne ze wszystkimi wymaganiami
- **Raportowanie** - łatwe statystyki per projekt

### ⚠️ Negatywne / Ryzyka
- **Złożoność zapytań** - konieczność filtrowania po `left_at IS NULL`
- **Ryzyko duplikatów** - unique constraint required
- **UX** - koordynator musi zrozumieć różnicę między "aktywny" i "zakończony"

### Query patterns

```sql
-- Aktywne projekty pacjenta
SELECT p.* FROM projects p
JOIN patient_projects pp ON p.id = pp.project_id
WHERE pp.patient_id = ? AND pp.left_at IS NULL;

-- Pacjenci w projekcie (aktywni)
SELECT pt.* FROM patients pt
JOIN patient_projects pp ON pt.id = pp.patient_id
WHERE pp.project_id = ? AND pp.left_at IS NULL;

-- Historia przypisań pacjenta
SELECT p.*, pp.enrolled_at, pp.left_at, pp.removal_reason
FROM projects p
JOIN patient_projects pp ON p.id = pp.project_id
WHERE pp.patient_id = ?
ORDER BY pp.enrolled_at DESC;

-- Compliance projektu (średni)
SELECT AVG(pp.compliance_score)
FROM patient_projects pp
WHERE pp.project_id = ? AND pp.left_at IS NULL;
```

## Compliance

| Wymaganie | Status | Implementacja |
|-----------|--------|---------------|
| `ww.20` - Jeden lub wiele projektów | ✅ | PatientProject relacja M:N |
| `ww.21` - Indywidualnie lub grupowo | ✅ | Dwa tryby w portalu |
| `ww.22` - Walidacja HIS | ✅ | Przy rejestracji pacjenta |
| `ww.23` - Usunięcie z powodem | ✅ | `removal_reason` wymagane |
| `ww.24` - Historia przypisań | ✅ | `left_at` nullable, audyt |
| `ww.25` - Powiadomienie | ✅ | Email + push po utworzeniu |
| `ww.26` - Przenoszenie | ✅ | Remove + create z historią |

## Implementation Notes

- Unique constraint: `(patient_id, project_id, left_at)` zapobiega duplikatom
- Indeksy: `patient_id`, `project_id`, `left_at` dla wydajności
- Trigger lub event: wysyłka powiadomienia po utworzeniu `PatientProject`
- Audyt: `@EntityListeners` z `AuditService`
- API: `POST /api/v1/projects/{id}/patients` (indywidualne), `POST /api/v1/projects/{id}/patients/bulk` (grupowe)
