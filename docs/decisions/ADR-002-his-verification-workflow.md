---
name: HIS Verification Workflow
description: Weryfikacja tożsamości pacjenta przez personel z portalu (nie z mobile)
type: decision
---

# ADR-002: Workflow Weryfikacji HIS przez Personel

## Status
**PROPOSED** - 2026-04-23

## Kontekst

Specyfikacja wymaga (`funk.02`, `funk.06`, `int.01`) weryfikacji tożsamości pacjenta poprzez integrację z systemem HIS podczas rejestracji.

**Problem bezpieczeństwa:** Jeśli aplikacja mobilna bezpośrednio odpytuje HIS z numerem kartoteki i PESEL, osoba niepowołana może użyć aplikacji do **enumeracji pacjentów** placówki medycznej (sprawdzenie czy dana osoba jest pacjentem).

Wymagania:
- `funk.02` - Weryfikacja tożsamości przez integrację z HIS
- `funk.06` - Pobranie podstawowych danych demograficznych z HIS
- `ww-nf-int.01` - Integracja obejmuje weryfikację i pobranie danych
- `ww.60` - Walidacja istnienia pacjenta w HIS przed przypisaniem do projektu

## Decyzja

**Wybrano: Weryfikacja HIS wykonywana przez personel z portalu (nie z aplikacji mobilnej)**

### Flow rejestracji

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Pacjent   │     │   Mobile    │     │   Backend   │     │   Portal    │
│   (App)     │     │    App      │     │    API      │     │   (Staff)   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │ 1. Rejestracja    │                   │                   │
       │ (email/telefon)   │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │ 2. POST /register │                   │
       │                   │ (bez danych HIS)  │                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │                   │ 3. Utwórz konto   │
       │                   │                   │ status: PENDING   │
       │                   │<──────────────────│                   │
       │                   │                   │                   │
       │ 4. Status:        │                   │                   │
       │ "Oczekuje na      │                   │                   │
       │ weryfikację"      │                   │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
       │                   │                   │ 5. Powiadomienie  │
       │                   │                   │ (email/SMS)       │
       │                   │                   │ "Zgłoś się na     │
       │                   │                   │ weryfikację"      │
       │                   │                   │                   │
       │                   │                   │                   │ 6. Lista
       │                   │                   │                   │ oczekujących
       │                   │                   │<──────────────────│
       │                   │                   │                   │
       │                   │                   │                   │ 7. Weryfikacja
       │                   │                   │                   │ HIS (PESEL +
       │                   │                   │                   │ nr kartoteki)
       │                   │                   │<──────────────────│
       │                   │                   │                   │
       │                   │                   │ 8. GET /his/verify│
       │                   │                   │──────────────────>│
       │                   │                   │                   │
       │                   │                   │ 9. Dane pacjenta  │
       │                   │                   │<──────────────────│
       │                   │                   │                   │
       │                   │                   │ 10. Zatwierdź/    │
       │                   │                   │ Odrzuć z powodem  │
       │                   │                   │<──────────────────│
       │                   │                   │                   │
       │ 11. Powiadomienie │                   │                   │
       │ push: "Konto      │                   │                   │
       │ aktywowane"       │                   │                   │
       │<──────────────────│                   │                   │
```

### Model danych

```java
// Patient entity
public enum AccountStatus {
    PENDING_VERIFICATION,    // Oczekuje na weryfikację HIS
    ACTIVE,                  // Zweryfikowany, aktywny
    REJECTED,                // Odrzucony przez personel
    BLOCKED,                 // Zablokowany (5 nieudanych logowań)
    DEACTIVATED              // Dezaktywowany przez admina
}

public class VerificationRequest {
    private UUID id;
    private UUID patientId;
    private String hisCartNumber;      // Wprowadzone przez personel
    private String pesel;              // Wprowadzone przez personel
    private VerificationStatus status; // PENDING, APPROVED, REJECTED
    private String rejectionReason;    // Wymagane przy REJECTED
    private UUID verifiedBy;           // Staff user ID
    private Instant verifiedAt;
    private String verificationMethod; // HIS_VERIFY, MANUAL_OVERRIDE
}
```

## Alternatywy

### Opcja 1: Weryfikacja bezpośrednio z mobile app
**Odrzucona ponieważ:**
- **Ryzyko bezpieczeństwa** - enumeracja pacjentów przez PESEL
- Wymaga podania numeru kartoteki w mobile app (narażenie na ataki)
- Brak możliwości weryfikacji manualnej (bez HIS)

### Opcja 2: Kod aktywacyjny z wydruku
**Rozważana jako uzupełnienie (US-NH-21):**
- Pacjent otrzymuje jednorazowy kod przy rejestracji w placówce
- Kod ważny 72h
- **Zdecydowano:** Dodać jako fallback w Phase 2, nie w MVP

## Konsekwencje

### ✅ Pozytywne
- **Bezpieczeństwo** - brak możliwości enumeracji pacjentów
- **Elastyczność** - personel może zweryfikować manualnie (bez HIS)
- **Compliance** - zgodne z `ww-nf-int.04` (działanie niezależnie od HIS)
- **Audyt** - pełna historia weryfikacji w bazie

### ⚠️ Negatywne / Ryzyka
- **Dodatkowy krok** - pacjent nie ma natychmiastowego dostępu
- **Obciążenie personelu** - koordynator musi weryfikować ręcznie
- **Czas oczekiwania** - pacjent może czekać do 24-48h na aktywację
- **Komunikacja** - pacjent musi zrozumieć dlaczego czeka (UX)

### Mitigacja ryzyk
- jasny komunikat w aplikacji: "Twoje konto wymaga weryfikacji przez personel medyczny. Otrzymasz powiadomienie w ciągu 24-48h."
- powiadomienie SMS/email po rejestracji z numerem kontaktowym do koordynatora
- dashboard dla koordynatora z listą oczekujących weryfikacji

## Compliance

| Wymaganie | Status | Notatki |
|-----------|--------|---------|
| `funk.02` - Weryfikacja HIS | ✅ | Realizowane przez portal |
| `funk.06` - Pobranie danych z HIS | ✅ | Dane zapisywane w profilu |
| `ww.60` - Walidacja przed przypisaniem | ✅ | Blokada przypisania bez weryfikacji |
| `ww-nf-int.04` - Działanie bez HIS | ✅ | Manual override dostępny |
| `ww.59` - Synchronizacja danych | ✅ | Przy weryfikacji |

## Implementation Notes

- Encja `VerificationRequest` z pełnym audytem
- Endpoint `POST /api/v1/staff/verifications` (tylko dla ról Staff)
- GET `/api/v1/patients/verification-status` (dla pacjenta)
- Powiadomienie push po zmianie statusu
- Rate limiting dla staff endpointów (nadużycia)
- Encryption dla pól `pesel` i `hisCartNumber` w bazie (AES-256)
