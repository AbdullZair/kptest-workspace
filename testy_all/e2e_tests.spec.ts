import { test, expect } from '@playwright/test';

test.describe('KPTEST Portal - Testy E2E', () => {
  
  // Konfiguracja base URL
  test.use({ baseURL: 'http://localhost:3000' });

  // Test: TC-01 Logowanie - Sukces
  test('TC-01: Logowanie - Sukces', async ({ page }) => {
    console.log('🧪 Rozpoczynanie TC-01: Logowanie - Sukces');
    
    // Krok 1: Otwórz stronę logowania
    await page.goto('/login');
    await page.screenshot({ path: 'printscreeny/TC01_01_strona_logowania.png' });
    
    // Krok 2: Wprowadź email
    await page.fill('input[name="email"]', 'admin@kptest.com');
    await page.screenshot({ path: 'printscreeny/TC01_02_wprowadzono_email.png' });
    
    // Krok 3: Wprowadź hasło
    await page.fill('input[name="password"]', 'TestP@ssw0rd123');
    await page.screenshot({ path: 'printscreeny/TC01_03_wprowadzono_haslo.png' });
    
    // Krok 4: Kliknij przycisk "Zaloguj się"
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000); // Czekaj na odpowiedź backendu
    await page.screenshot({ path: 'printscreeny/TC01_04_kliknieto_login.png' });
    
    // Krok 5: Zweryfikuj przekierowanie do dashboardu
    const currentUrl = page.url();
    console.log(`Aktualny URL: ${currentUrl}`);
    
    // Sprawdź czy jesteśmy na dashboardzie
    expect(currentUrl).toContain('/dashboard');
    
    // Sprawdź czy widoczne jest powitanie (h1 zawiera greeting po i18n)
    const welcomeText = await page.textContent('h1');
    expect(welcomeText).toBeTruthy();
    
    await page.screenshot({ path: 'printscreeny/TC01_05_dashboard_success.png' });
    
    console.log('✅ TC-01: ZALICZONY');
  });

  // Test: TC-02 Logowanie - Błędne Hasło
  test('TC-02: Logowanie - Błędne Hasło', async ({ page }) => {
    console.log('🧪 Rozpoczynanie TC-02: Logowanie - Błędne Hasło');
    
    // Krok 1: Otwórz stronę logowania
    await page.goto('/login');
    await page.screenshot({ path: 'printscreeny/TC02_01_strona_logowania.png' });
    
    // Krok 2: Wprowadź email
    await page.fill('input[name="email"]', 'admin@kptest.com');
    
    // Krok 3: Wprowadź błędne hasło
    await page.fill('input[name="password"]', 'WrongPassword');
    await page.screenshot({ path: 'printscreeny/TC02_03_wprowadzono_bledne_haslo.png' });
    
    // Krok 4: Kliknij przycisk "Zaloguj się"
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'printscreeny/TC02_04_kliknieto_login.png' });
    
    // Krok 5: Zweryfikuj komunikat błędu
    const errorMessage = await page.locator('[data-testid="error-message"]').textContent();
    console.log(`Komunikat błędu: ${errorMessage}`);
    
    expect(errorMessage).toBeTruthy();
    expect((errorMessage ?? '').toLowerCase()).toContain('błąd');
    
    await page.screenshot({ path: 'printscreeny/TC02_05_blad_walidacji.png' });
    
    console.log('✅ TC-02: ZALICZONY');
  });

  // Test: TC-03 Rejestracja Pacjenta - Sukces
  // Backend tworzy konto ze statusem PENDING_VERIFICATION (US-NH-01) — bez tokenów,
  // więc sukces objawia się banerem "[data-testid=success-message]" i redirectem
  // na /login.
  test('TC-03: Rejestracja Pacjenta - Sukces', async ({ page }) => {
    console.log('🧪 Rozpoczynanie TC-03: Rejestracja Pacjenta - Sukces');

    // Krok 1: Otwórz stronę rejestracji
    await page.goto('/register');
    await page.screenshot({ path: 'printscreeny/TC03_01_strona_rejestracji.png' });

    // Krok 2: Wypełnij formularz (pesel + phone unikalne na każdy run)
    const stamp = Date.now();
    const randomDigits = String(Math.floor(Math.random() * 1e10)).padStart(10, '0');
    const testData = {
      email: `test.${stamp}@email.com`,
      phone: `+48${String(stamp).slice(-9)}`,
      pesel: `9${randomDigits}`,
      firstName: 'Test',
      lastName: 'Pacjent',
      password: 'TestP@ssw0rd123',
    };

    await page.fill('input[name="email"]', testData.email);
    await page.fill('input[name="pesel"]', testData.pesel);
    await page.fill('input[name="phone"]', testData.phone);
    await page.fill('input[name="firstName"]', testData.firstName);
    await page.fill('input[name="lastName"]', testData.lastName);
    await page.fill('input[name="password"]', testData.password);
    await page.fill('input[name="confirmPassword"]', testData.password);

    await page.screenshot({ path: 'printscreeny/TC03_02_wypelniono_formularz.png' });

    // Krok 3: Zaakceptuj regulamin
    await page.check('input[name="acceptTerms"]');

    // Krok 4: Kliknij "Zarejestruj się"
    await page.click('button[type="submit"]');

    // Krok 5: Zweryfikuj komunikat sukcesu (PENDING_VERIFICATION)
    await page.waitForSelector('[data-testid="success-message"]', { timeout: 10000 });
    const successMessage = await page.textContent('[data-testid="success-message"]');
    console.log(`Komunikat sukcesu: ${successMessage}`);
    expect(successMessage).toBeTruthy();
    expect((successMessage ?? '').toLowerCase()).toContain('weryfikac');

    await page.screenshot({ path: 'printscreeny/TC03_04_rejestracja_sukces.png' });

    console.log('✅ TC-03: ZALICZONY');
  });

  // Test: TC-04 Nawigacja - Dashboard
  test('TC-04: Nawigacja - Dashboard', async ({ page }) => {
    console.log('🧪 Rozpoczynanie TC-04: Nawigacja - Dashboard');
    
    // Krok 1: Zaloguj się jako admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@kptest.com');
    await page.fill('input[name="password"]', 'TestP@ssw0rd123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'printscreeny/TC04_01_zalogowano.png' });
    
    // Krok 2: Sprawdź widoczność dashboardu
    const dashboardVisible = await page.isVisible('h1');
    expect(dashboardVisible).toBe(true);
    
    // Krok 3: Kliknij każdy element menu
    const menuItems = [
      { selector: '[data-testid="menu-dashboard"]', expected: '/dashboard' },
      { selector: '[data-testid="menu-patients"]', expected: '/patients' },
      { selector: '[data-testid="menu-projects"]', expected: '/projects' },
      { selector: '[data-testid="menu-calendar"]', expected: '/calendar' },
    ];
    
    for (const item of menuItems) {
      if (await page.isVisible(item.selector)) {
        await page.click(item.selector);
        await page.waitForTimeout(1000);
        
        const currentUrl = page.url();
        console.log(`Menu item: ${item.selector} -> URL: ${currentUrl}`);
        
        expect(currentUrl).toContain(item.expected);
      }
    }
    
    await page.screenshot({ path: 'printscreeny/TC04_02_nawigacja_test.png' });
    
    console.log('✅ TC-04: ZALICZONY');
  });

  // Test: TC-05 Formularz - Walidacja Pól
  test('TC-05: Formularz - Walidacja Pól', async ({ page }) => {
    console.log('🧪 Rozpoczynanie TC-05: Formularz - Walidacja Pól');
    
    // Krok 1: Otwórz formularz rejestracji (ma walidację Zod na wszystkich polach)
    await page.goto('/register');
    await page.screenshot({ path: 'printscreeny/TC05_01_otwarty_formularz.png' });

    // Krok 2: Pozostaw pola puste i spróbuj zapisać
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'printscreeny/TC05_02_puste_pola.png' });

    // Krok 3: Sprawdź komunikaty walidacji
    const validationErrors = await page.locator('[data-testid="validation-error"]').count();
    console.log(`Liczba błędów walidacji: ${validationErrors}`);
    expect(validationErrors).toBeGreaterThan(0);

    // Krok 4: Wypełnij niepoprawne dane
    await page.fill('input[name="email"]', 'niepoprawny-email');
    await page.fill('input[name="password"]', '123'); // Za krótkie hasło

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'printscreeny/TC05_03_niepoprawne_dane.png' });

    // Krok 5: Sprawdź ponownie komunikaty błędów
    const errorsAfter = await page.locator('[data-testid="validation-error"]').count();
    expect(errorsAfter).toBeGreaterThan(0);
    
    console.log('✅ TC-05: ZALICZONY');
  });

  // Test: TC-06 Responsywność - Mobile
  test('TC-06: Responsywność - Mobile', async ({ browser }) => {
    console.log('🧪 Rozpoczynanie TC-06: Responsywność - Mobile');
    
    // Krok 1: Otwórz w trybie mobile
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 } // iPhone SE
    });
    const page = await context.newPage();
    
    await page.goto('/login');
    await page.screenshot({ path: 'printscreeny/TC06_01_mobile_login.png' });
    
    // Krok 2: Zaloguj się
    await page.fill('input[name="email"]', 'admin@kptest.com');
    await page.fill('input[name="password"]', 'TestP@ssw0rd123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'printscreeny/TC06_02_mobile_dashboard.png' });
    
    // Krok 3: Sprawdź menu hamburger
    const hamburgerMenu = await page.isVisible('[data-testid="hamburger-menu"]');
    console.log(`Menu hamburger widoczne: ${hamburgerMenu}`);
    
    // Krok 4: Sprawdź układ strony
    const contentVisible = await page.isVisible('main');
    expect(contentVisible).toBe(true);
    
    await page.screenshot({ path: 'printscreeny/TC06_03_mobile_layout.png' });
    
    await context.close();
    console.log('✅ TC-06: ZALICZONY');
  });

  // Test: TC-07 Panel RODO - Eksport Danych
  // Implementacja: /admin/rodo (RodoPanelPage) — lista pacjentów + sekcje
  // Eksport / Anonimizacja / Usunięcie. Per-patient widok pozostaje na
  // /admin/patients/:id/data.
  test('TC-07: Panel RODO - Eksport Danych', async ({ page }) => {
    console.log('🧪 Rozpoczynanie TC-07: Panel RODO - Eksport Danych');
    
    // Krok 1: Zaloguj się jako admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@kptest.com');
    await page.fill('input[name="password"]', 'TestP@ssw0rd123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Krok 2: Przejdź do panelu RODO
    await page.goto('/admin/rodo');
    await page.screenshot({ path: 'printscreeny/TC07_01_panel_rodo.png' });
    
    // Krok 3: Wybierz pacjenta
    await page.click('[data-testid="patient-select"]');
    await page.screenshot({ path: 'printscreeny/TC07_02_wybrano_pacjenta.png' });
    
    // Krok 4: Kliknij "Eksportuj dane"
    await page.click('[data-testid="export-data-button"]');
    await page.screenshot({ path: 'printscreeny/TC07_03_modal_eksportu.png' });
    
    // Krok 5: Wybierz format JSON
    await page.click('[data-testid="format-json"]');
    
    // Krok 6: Pobierz plik
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-button"]');
    const download = await downloadPromise;
    
    console.log(`Pobrany plik: ${download.suggestedFilename()}`);
    expect(download.suggestedFilename()).toContain('.json');
    
    await page.screenshot({ path: 'printscreeny/TC07_04_eksport_sukces.png' });
    
    console.log('✅ TC-07: ZALICZONY');
  });

  // Test: TC-08 i18n - Zmiana Języka
  test('TC-08: i18n - Zmiana Języka', async ({ page }) => {
    console.log('🧪 Rozpoczynanie TC-08: i18n - Zmiana Języka');
    
    // Krok 1: Zaloguj się i poczekaj na przekierowanie do dashboardu
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@kptest.com');
    await page.fill('input[name="password"]', 'TestP@ssw0rd123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Krok 2: Przejdź do ustawień
    await page.goto('/settings');
    await page.waitForSelector('[data-testid="settings-page"]', { timeout: 10000 });
    await page.screenshot({ path: 'printscreeny/TC08_01_ustawienia_pl.png' });
    
    // Krok 3: Zmień język na EN
    await page.click('[data-testid="language-en"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'printscreeny/TC08_02_zmiana_na_en.png' });
    
    // Krok 4: Zweryfikuj tłumaczenie
    const englishText = await page.textContent('[data-testid="settings-title"]');
    expect((englishText ?? '').toLowerCase()).toContain('settings');
    
    // Krok 5: Zmień z powrotem na PL
    await page.click('[data-testid="language-pl"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'printscreeny/TC08_03_zmiana_na_pl.png' });
    
    // Krok 6: Zweryfikuj powrót do PL
    const polishText = await page.textContent('[data-testid="settings-title"]');
    expect((polishText ?? '').toLowerCase()).toContain('ustawienia');
    
    console.log('✅ TC-08: ZALICZONY');
  });
});
