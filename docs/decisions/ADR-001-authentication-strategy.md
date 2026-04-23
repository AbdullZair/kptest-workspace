---
name: Authentication Strategy (JWT + 2FA)
description: Wybór strategii uwierzytelniania: JWT tokens z opcjonalnym 2FA TOTP
type: decision
---

# ADR-001: Strategia Uwierzytelniania (JWT + 2FA)

## Status
**PROPOSED** - 2026-04-23

## Kontekst

System KPTEST wymaga bezpiecznego mechanizmu uwierzytelniania dla:
- Pacjentów (aplikacja mobilna)
- Personelu medycznego (portal webowy)

Wymagania specyfikacji:
- `funk.03` - Logowanie za pomocą hasła
- `funk.04` - Uwierzytelnianie dwuskładnikowe (2FA) jako opcja
- `sec.03` - Silne hasło (min. 10 znaków, wielkie/małe litery, cyfry, znaki specjalne)
- `sec.04` - Blokada konta po 5 nieudanych próbach (15 minut)
- `ww.04` - Logowanie z 2FA dla personelu

Rozważane były następujące opcje:
1. Sesje serwerowe (tradycyjne)
2. JWT tokens (stateless)
3. OAuth2/OIDC z zewnętrznym providerem

## Decyzja

**Wybrano: JWT tokens z opcjonalnym 2FA TOTP**

### Uzasadnienie

1. **Skalowalność horyzontalna** - JWT jest stateless, co ułatwia skalowanie backendu
2. **Wydajność** - Brak konieczności odpytywania bazy/sesji przy każdym requeście
3. **Mobile-friendly** - JWT dobrze współpracuje z aplikacjami mobilnymi (offline token)
4. **2FA jako opcja** - Zgodnie ze specyfikacją (`funk.04`), 2FA jest opcjonalne dla pacjentów
5. **RODO compliance** - Tokeny mogą zawierać minimalne dane, audyt logowań w osobnej tabeli

### Implementacja

```
Flow logowania:
1. POST /api/v1/auth/login (email/telefon + hasło)
2. Backend weryfikuje credentials
3. Jeśli 2FA włączone → zwraca tymczasowy token + wymóg 2FA
4. POST /api/v1/auth/2fa/verify (kod TOTP)
5. Jeśli poprawny → zwraca JWT access token + refresh token

Struktura JWT:
{
  "sub": "user-id",
  "role": "PATIENT|COORDINATOR|DOCTOR|ADMIN",
  "iat": 1234567890,
  "exp": 1234567890,
  "2fa_verified": true|false
}

Refresh token:
- Przechowywany w httpOnly cookie (frontend)
- Secure storage (mobile Keychain/Keystore)
- Ważny 7 dni
- Single-use z rotation
```

## Alternatywy

### Opcja 1: Sesje serwerowe z Redis
**Odrzucona ponieważ:**
- Wymaga sticky sessions lub centralnego Redis
- Gorsza skalowalność horyzontalna
- Dodatkowa warstwa infrastruktury

### Opcja 2: OAuth2/OIDC (Keycloak/Auth0)
**Odrzucona ponieważ:**
- Overengineering dla MVP
- Dodatkowy koszt (Auth0)
- Złożoność operacyjna (Keycloak)
- Może być rozważone w Phase 2

## Konsekwencje

### ✅ Pozytywne
- Prosta skalowalność backendu
- Dobre wsparcie dla mobile (offline tokens)
- Zgodność ze wszystkimi wymaganiami specyfikacji
- Łatwa integracja z React i React Native

### ⚠️ Negatywne / Ryzyka
- **Token revocation** - wymaga listy blacklistowanych tokenów (Redis)
- **Token size** - JWT może być duże (rozwiązanie: minimalny payload)
- **2FA optional** - pacjent może nie włączyć 2FA (ryzyko bezpieczeństwa)
- **Refresh token rotation** - wymaga implementacji rotation z grace period

## Compliance

| Wymaganie | Status |
|-----------|--------|
| `funk.03` - Logowanie hasłem | ✅ |
| `funk.04` - 2FA opcjonalne | ✅ |
| `sec.03` - Silne hasło | ✅ (walidacja przy rejestracji) |
| `sec.04` - Blokada po 5 próbach | ✅ (Redis rate limiter) |
| `ww.04` - 2FA dla personelu | ✅ (wymuszone dla ról Admin/Koordynator) |

## Implementation Notes

- Biblioteka: `io.jsonwebtoken:jjwt` dla JWT
- 2FA: `dev.topham:totp` lub własna implementacja RFC 6238
- Rate limiting: Redis + Spring AOP
- Password hashing: BCrypt z cost factor 12
