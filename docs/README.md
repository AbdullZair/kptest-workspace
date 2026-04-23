# Dokumentacja Systemu KPTEST

Kompleksowa dokumentacja techniczna systemu telemedycznego KPTEST (IFPS-TMS).

## 📁 Struktura Katalogów

```
docs/
├── api/                    # Dokumentacja endpointów API
├── architecture/           # Decyzje i diagramy architektoniczne
├── decisions/              # Architecture Decision Records (ADR)
└── setup/                  # Instrukcje instalacji i konfiguracji
```

## 🔗 Szybkie Linki

| Dokumentacja | Opis |
|--------------|------|
| [System Overview](./architecture/system-overview.md) | Wysokopoziomowy widok architektury |
| [Data Model](./architecture/data-model.md) | Model danych i relacje encji |
| [Local Development](./setup/local-development.md) | Konfiguracja środowiska lokalnego |
| [API Reference](./api/) | Dokumentacja wszystkich endpointów |

## 👥 Role i Dostęp

| Rola | Opis | Dostęp |
|------|------|--------|
| **Administrator** | Zarządzanie systemem | Pełny dostęp |
| **Koordynator** | Koordynacja terapii | Zarządzanie pacjentami, projektami |
| **Lekarz/Terapeuta** | Prowadzenie terapii | Dostęp do pacjentów w projekcie |
| **Pacjent** | Uczestnik terapii | Aplikacja mobilna |

## 📊 Status Dokumentacji

| Sekcja | Postęp | Ostatnia aktualizacja |
|--------|--------|----------------------|
| Architecture | 🟡 W trakcie | 2026-04-23 |
| API | 🔴 Nie rozpoczęte | - |
| Decisions | 🔴 Nie rozpoczęte | - |
| Setup | 🟡 W trakcie | 2026-04-23 |

---

**KPTEST Team** © 2026
