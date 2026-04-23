# Architektura Systemu

Dokumentacja architektoniczna systemu KPTEST.

## 📐 Diagramy

| Diagram | Opis | Status |
|---------|------|--------|
| [System Overview](./system-overview.md) | Diagram kontekstowy całego systemu | 🟡 W trakcie |
| [Data Model](./data-model.md) | Model ERD bazy danych | 🟡 W trakcie |
| [Sequence Diagrams](./sequence-diagrams.md) | Diagramy sekwencji dla kluczowych flow | 🔴 Nie rozpoczęte |
| [Deployment](./deployment.md) | Architektura wdrożeniowa | 🔴 Nie rozpoczęte |

## 🏗️ Komponenty Systemu

### Backend (Spring Boot)
- **Controller Layer** - REST API endpoints
- **Service Layer** - Logika biznesowa
- **Repository Layer** - Dostęp do danych (JPA)
- **Security Layer** - JWT authentication, RBAC

### Frontend (React)
- **Feature-Sliced Design** - Architektura oparta o feature
- **Redux Toolkit** - Zarządzanie stanem
- **RTK Query** - API calls i cache

### Mobile (React Native)
- **Expo** - Framework
- **Redux Toolkit** - Stan aplikacji
- **Offline-first** - Synchronizacja danych

## 🔒 Bezpieczeństwo

- **RBAC** - Role Based Access Control
- **JWT** - Token-based authentication
- **2FA** - TOTP (Time-based One-Time Password)
- **Audit Log** - Rejestracja wszystkich operacji
- **RODO** - Compliance (szyfrowanie, prawo do zapomnienia)

## 📊 Wydajność

| Wymaganie | Cel | Strategia |
|-----------|-----|-----------|
| Czas odpowiedzi < 2s | 95% requestów | Redis cache, indeksy DB |
| 500+ concurrent users | Portal webowy | Load balancing, horizontal scaling |
| 5000+ concurrent users | Mobile app | CDN, API rate limiting |
| Ładowanie listy < 3s | 1000 pacjentów | Pagination, lazy loading |

---

**Ostatnia aktualizacja:** 2026-04-23
