# Architecture Decision Records (ADR)

Rejestr decyzji architektonicznych podjętych w trakcie projektu KPTEST.

## 📋 Co to jest ADR?

ADR (Architecture Decision Record) to dokument opisujący:
- **Kontekst** - jaka sytuacja doprowadziła do decyzji
- **Decyzja** - co zostało wybrane i dlaczego
- **Konsekwencje** - jakie są pozytywne i negatywne skutki

## 📝 Szablon ADR

Każdy ADR follows template:
```markdown
# ADR-XXX: Tytuł Decyzji

## Status
[PROPOSED | ACCEPTED | DEPRECATED | SUPERSEDED]

## Kontekst
Opis sytuacji i problemu do rozwiązania.

## Decyzja
Wybrana opcja i uzasadnienie.

## Alternatywy
Inne rozważane opcje i dlaczego zostały odrzucone.

## Konsekwencje
- ✅ Pozytywne
- ⚠️ Negatywne / Ryzyka

## Compliance
Jak decyzja wpływa na wymagania specyfikacji.
```

## 📚 Lista ADR

| Numer | Tytuł | Status | Data |
|-------|-------|--------|------|
| [ADR-001](./ADR-001-authentication-strategy.md) | Strategia uwierzytelniania (JWT + 2FA) | 🔴 Proposed | 2026-04-23 |
| [ADR-002](./ADR-002-his-verification-workflow.md) | Workflow weryfikacji HIS przez personel | 🔴 Proposed | 2026-04-23 |
| [ADR-003](./ADR-003-patient-project-assignment.md) | Model przypisywania pacjentów do projektów | 🔴 Proposed | 2026-04-23 |

## 🔄 Proces Zmiany

1. **Propozycja** - Utwórz nowy ADR z statusem PROPOSED
2. **Dyskusja** - Zespół review i komentuje
3. **Akceptacja** - Zmiana statusu na ACCEPTED
4. **Implementacja** - Kod zgodny z ADR
5. **Deprecation** - Jeśli decyzja zostanie zmieniona, oznacz jako DEPRECATED

---

**Ostatnia aktualizacja:** 2026-04-23
