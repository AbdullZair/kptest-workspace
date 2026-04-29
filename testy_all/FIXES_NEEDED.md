# 🔧 KPTEST - LISTA NAPRAW DO TESTÓW E2E

**Data:** 2026-04-28  
**Status testów:** 3/8 passed (37.5%)  
**Cel:** 8/8 passed (100%)

---

## ✅ TESTY ZALICZONE

### TC-01: Logowanie - Sukces ✅
**Status:** PASSED  
**Działa:** Login API działa, frontend ma data-testid

### TC-04: Nawigacja - Dashboard ✅
**Status:** PASSED  
**Działa:** Sidebar z data-testid działa

### TC-06: Responsywność - Mobile ✅
**Status:** PASSED  
**Działa:** Hamburger menu z data-testid działa

---

## ❌ TESTY DO NAPRAWY

### TC-02: Logowanie - Błędne Hasło ❌

**Błąd:** Test timeout - nie znajduje `data-testid="error-message"` przy błędzie logowania

**Przyczyna:** 
- Backend zwraca błąd ale frontend może nie renderować go z proper data-testid
- Lub error state nie jest czyścione przed testem

**Fix:**
1. Sprawdź czy `LoginPage` renderuje error z `data-testid="error-message"`
2. Upewnij się że `clearAuthError()` jest wywołane przed testem
3. Dodaj `waitFor` na error message

**Plik do sprawdzenia:** `frontend/src/pages/auth/LoginPage.tsx`
```tsx
// Już jest: data-testid="error-message" ✅
// Sprawdź czy error state jest poprawnie ustawiane
```

**Test do naprawy:** `testy_all/e2e_tests.spec.ts` linia 46
```typescript
// Dodaj waitFor na error message
await page.waitForSelector('[data-testid="error-message"]', { state: 'visible' });
const errorMessage = await page.locator('[data-testid="error-message"]').textContent();
expect(errorMessage).toBeTruthy();
```

---

### TC-03: Rejestracja Pacjenta - Sukces ❌

**Błąd:** Test timeout - rejestracja nie przechodzi

**Przyczyna:**
- Backend endpoint `/api/v1/auth/register` może nie działać
- Lub frontend nie wysyła poprawnych danych

**Fix:**
1. Sprawdź czy backend endpoint istnieje:
   ```bash
   curl -X POST http://localhost:8080/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"Test123!","pesel":"12345678901",...}'
   ```

2. Sprawdź czy `RegisterPage` wysyła poprawne dane

**Plik do sprawdzenia:** `frontend/src/pages/auth/RegisterPage.tsx`

**Test do naprawy:** `testy_all/e2e_tests.spec.ts` linia 78
```typescript
// Sprawdź czy success message się pojawia
await page.waitForSelector('[data-testid="success-message"]', { 
  state: 'visible',
  timeout: 10000
});
```

---

### TC-05: Formularz - Walidacja Pól ❌

**Błąd:** Test timeout - nie znajduje `data-testid="validation-error"`

**Przyczyna:** 
- Input component renderuje błędy wewnątrz siebie ale bez data-testid
- Test szuka `data-testid="validation-error"` ale to nie istnieje

**Fix - OPCJA 1: Dodaj data-testid do Input error**

**Plik:** `frontend/src/shared/components/Input.tsx`
```tsx
// Wewnątrz komponentu Input:
{error && (
  <p className="text-sm text-error-600" data-testid="validation-error">
    {error}
  </p>
)}
```

**Fix - OPCJA 2: Zmień test na inny selector**

**Plik:** `testy_all/e2e_tests.spec.ts` linia 164
```typescript
// Zamiast szukać data-testid="validation-error"
// Szukaj po klasie CSS lub text content
const validationErrors = await page.locator('.text-error-600').count();
expect(validationErrors).toBeGreaterThan(0);
```

**Rekomendacja:** OPCJA 1 - dodać data-testid do Input component

---

### TC-07: Panel RODO - Eksport Danych ❌

**Błąd:** Test timeout - nie znajduje `data-testid="patient-select"`

**Przyczyna:**
- PatientDataAdminPage nie ma data-testid w komponentach
- Lub strona `/admin/rodo` nie istnieje

**Fix:**

**Plik:** `frontend/src/features/admin/ui/PatientDataAdminPage.tsx`
```tsx
// Dodaj data-testid do:
<select data-testid="patient-select">
<button data-testid="export-data-button">
<button data-testid="format-json">
<button data-testid="download-button">
```

**Plik:** `testy_all/e2e_tests.spec.ts` linia 231
```typescript
// Sprawdź czy strona się ładuje
await page.goto('/admin/rodo');
await page.waitForSelector('[data-testid="patient-select"]', { 
  state: 'visible',
  timeout: 10000
});
```

**Uwaga:** Sprawdź czy ruta `/admin/rodo` istnieje w routerze!

---

### TC-08: i18n - Zmiana Języka ❌

**Błąd:** Test timeout - nie znajduje `data-testid="language-en"`

**Przyczyna:**
- Strona `/settings` może nie istnieć
- LanguageSwitcher może nie być widoczny
- Test szuka złego selectora

**Fix:**

**Krok 1: Sprawdź czy SettingsPage istnieje**

**Plik:** `frontend/src/pages/settings/SettingsPage.tsx`
```tsx
// Upewnij się że strona istnieje i ma:
<div data-testid="settings-page">
  <h1 data-testid="settings-title">Ustawienia</h1>
  <LanguageSwitcher />
</div>
```

**Krok 2: Sprawdź LanguageSwitcher**

**Plik:** `frontend/src/features/settings/ui/LanguageSwitcher.tsx`
```tsx
// Już dodane: ✅
<div data-testid="language-switcher">
  <button data-testid="language-pl">PL</button>
  <button data-testid="language-en">EN</button>
</div>
```

**Krok 3: Napraw test**

**Plik:** `testy_all/e2e_tests.spec.ts` linia 270
```typescript
// Upewnij się że strona settings istnieje
await page.goto('/settings');
await page.waitForSelector('[data-testid="language-switcher"]', { 
  state: 'visible',
  timeout: 10000
});

// Sprawdź czy przyciski są widoczne
await page.waitForSelector('[data-testid="language-en"]', { 
  state: 'visible',
  timeout: 5000
});
await page.click('[data-testid="language-en"]');
```

---

## 🎯 PRIORYTETY NAPRAW

### Priorytet 1 (Najważniejsze)
1. **TC-05: Walidacja** - Dodaj `data-testid="validation-error"` do Input component
2. **TC-03: Rejestracja** - Sprawdź czy backend endpoint działa

### Priorytet 2 (Ważne)
3. **TC-07: RODO Panel** - Dodaj data-testid do admin components
4. **TC-08: i18n** - Sprawdź czy SettingsPage istnieje

### Priorytet 3 (Mniejsze)
5. **TC-02: Login Error** - Dodaj waitFor na error message

---

## 📝 SZYBKIE FIXY

### Fix 1: Input Component - Validation Error
```tsx
// frontend/src/shared/components/Input.tsx
// Znajdź miejsce gdzie renderowany jest error i dodaj data-testid:

{error && (
  <p className="text-sm text-error-600 mt-1" data-testid="validation-error" role="alert">
    {error}
  </p>
)}
```

### Fix 2: Settings Page
```tsx
// frontend/src/pages/settings/SettingsPage.tsx (stwórz jeśli nie istnieje)

import { LanguageSwitcher } from '@features/settings/ui/LanguageSwitcher'

export const SettingsPage = () => {
  return (
    <div data-testid="settings-page">
      <h1 data-testid="settings-title">Ustawienia</h1>
      <LanguageSwitcher data-testid="language-switcher-component" />
    </div>
  )
}
```

### Fix 3: PatientDataAdminPage
```tsx
// frontend/src/features/admin/ui/PatientDataAdminPage.tsx

// Dodaj data-testid do select i buttons:
<select data-testid="patient-select">
<button data-testid="export-data-button">
<button data-testid="format-json">
<button data-testid="format-pdf">
<button data-testid="download-button">
```

---

## 🧪 URUCHOMIENIE TESTÓW PO NAPRAWACH

```bash
cd /home/user1/KPTESTPRO/testy_all

# Napraw komponenty (Input, SettingsPage, PatientDataAdminPage)

# Uruchom pojedyncze testy
npx playwright test --grep "TC-05"  # Walidacja
npx playwright test --grep "TC-03"  # Rejestracja
npx playwright test --grep "TC-07"  # RODO
npx playwright test --grep "TC-08"  # i18n
npx playwright test --grep "TC-02"  # Login error

# Uruchom wszystkie testy
npx playwright test --project=chromium --reporter=list

# Zobacz raport HTML
npx playwright show-report
```

---

## 📊 OCZEKIWANY WYNIK PO NAPRAWACH

```
✅ TC-01: Logowanie - Sukces
✅ TC-02: Logowanie - Błędne Hasło
✅ TC-03: Rejestracja Pacjenta - Sukces
✅ TC-04: Nawigacja - Dashboard
✅ TC-05: Formularz - Walidacja Pól
✅ TC-06: Responsywność - Mobile
✅ TC-07: Panel RODO - Eksport Danych
✅ TC-08: i18n - Zmiana Języka

8 passed (100%)
```

---

## 📁 PLIKI DO EDYCJI

### Frontend Components (do naprawy)
1. `frontend/src/shared/components/Input.tsx` - Dodaj data-testid do error
2. `frontend/src/pages/settings/SettingsPage.tsx` - Stwórz/napraw
3. `frontend/src/features/admin/ui/PatientDataAdminPage.tsx` - Dodaj data-testid

### Test Files (do naprawy)
1. `testy_all/e2e_tests.spec.ts` - Dodaj waitFor na elementy

---

**Last Updated:** 2026-04-28  
**Next Action:** Napraw Input component i SettingsPage  
**Priority:** Wysoki

---

**Koniec listy napraw.**
