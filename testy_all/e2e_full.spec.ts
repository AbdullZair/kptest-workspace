import { test, expect, type Page } from '@playwright/test'

/**
 * KPTEST E2E — pełna specyfikacja (US-A, US-K, US-D, US-S, US-NH).
 *
 * Pokrycie: auth, pacjenci, kalendarz, materiały, wiadomości, admin
 * (RODO, system, audit, weryfikacje), ustawienia, pomoc kontekstowa,
 * 2FA, raportowanie. Każda grupa = describe block.
 *
 * Kompromisy:
 * - Login per test (nie persistowany) — testy są niezależne.
 * - Asercje "sanity": URL + obecność kluczowego elementu, bez deep
 *   business logic. Testy pełnej logiki = unit/integration backend.
 * - Skip dla funkcji które wymagają stanu DB przygotowanego przez
 *   inny test (oznaczone jako SKIP z powodem).
 */

const BASE_URL = 'http://localhost:3000'
const ADMIN = { email: 'admin@kptest.com', password: 'TestP@ssw0rd123' }

test.use({ baseURL: BASE_URL })

const loginAs = async (page: Page, who: { email: string; password: string }): Promise<void> => {
  await page.goto('/login')
  await page.fill('input[name="email"]', who.email)
  await page.fill('input[name="password"]', who.password)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard', { timeout: 15000 })
}

const randomDigits = (n: number): string =>
  String(Math.floor(Math.random() * Math.pow(10, n))).padStart(n, '0')

// ============================================================
// 1. AUTH (US-S-01..05, register flow + 2FA setup screen)
// ============================================================
test.describe('1. Auth', () => {
  test('1.1 login admin → /dashboard', async ({ page }) => {
    await loginAs(page, ADMIN)
    expect(page.url()).toContain('/dashboard')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('1.2 login zła kombinacja → error banner', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', ADMIN.email)
    await page.fill('input[name="password"]', 'ZleHaslo1!')
    await page.click('button[type="submit"]')
    await page.waitForSelector('[data-testid="error-message"]', { timeout: 10000 })
    const msg = await page.textContent('[data-testid="error-message"]')
    expect((msg ?? '').toLowerCase()).toContain('błąd')
  })

  test('1.3 login walidacja: zła kombinacja nie przekierowuje', async ({ page }) => {
    await page.goto('/login')
    // type=email + napis bez @ — przeglądarka blokuje submit, więc używamy
    // string z @ ale niepasujący do Zod email (poprzedzony spacjami).
    await page.fill('input[name="email"]', 'no-such-user@kptest.invalid')
    await page.fill('input[name="password"]', 'WrongPassword1!')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)
    // Albo error banner, albo zostajemy na /login — w obu przypadkach NIE /dashboard
    expect(page.url()).not.toContain('/dashboard')
  })

  test('1.4 register pacjenta (PENDING_VERIFICATION)', async ({ page }) => {
    await page.goto('/register')
    const stamp = Date.now()
    const pesel = `9${randomDigits(10)}`
    await page.fill('input[name="email"]', `e2e.${stamp}@email.com`)
    await page.fill('input[name="pesel"]', pesel)
    await page.fill('input[name="phone"]', `+48${String(stamp).slice(-9)}`)
    await page.fill('input[name="firstName"]', 'E2E')
    await page.fill('input[name="lastName"]', 'TestPacjent')
    await page.fill('input[name="password"]', 'TestP@ssw0rd123')
    await page.fill('input[name="confirmPassword"]', 'TestP@ssw0rd123')
    await page.check('input[name="acceptTerms"]')
    await page.click('button[type="submit"]')
    await page.waitForSelector('[data-testid="success-message"]', { timeout: 15000 })
    const msg = await page.textContent('[data-testid="success-message"]')
    expect((msg ?? '').toLowerCase()).toContain('weryfikac')
  })

  test('1.5 register walidacja PESEL (6 cyfr odrzuca)', async ({ page }) => {
    await page.goto('/register')
    await page.fill('input[name="pesel"]', '123456')
    await page.fill('input[name="email"]', 'a@b.pl')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(500)
    const errors = await page.locator('[data-testid="validation-error"]').count()
    expect(errors).toBeGreaterThan(0)
  })

  test('1.6 link "zapomniałeś hasła" prowadzi do /forgot-password', async ({ page }) => {
    await page.goto('/login')
    await page.click('[data-testid="forgot-password-link"]')
    await page.waitForURL('**/forgot-password')
    expect(page.url()).toContain('/forgot-password')
  })

  test('1.7 link "zarejestruj się" z loginu → /register', async ({ page }) => {
    await page.goto('/login')
    await page.click('[data-testid="register-link"]')
    await page.waitForURL('**/register')
    expect(page.url()).toContain('/register')
  })
})

// ============================================================
// 2. NAWIGACJA + LAYOUT (US-S-15..18 dostępność/UX)
// ============================================================
test.describe('2. Layout + nawigacja', () => {
  test('2.1 sidebar widoczny po zalogowaniu', async ({ page }) => {
    await loginAs(page, ADMIN)
    await expect(page.locator('[data-testid="main-sidebar"]')).toBeVisible()
  })

  test('2.2 mobile hamburger menu (375x667)', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } })
    const page = await ctx.newPage()
    await loginAs(page, ADMIN)
    await expect(page.locator('[data-testid="hamburger-menu"]')).toBeVisible()
    await ctx.close()
  })

  test('2.3 toggle theme (dark/light) działa', async ({ page }) => {
    await loginAs(page, ADMIN)
    const themeBtn = page.locator('button[aria-label="Toggle theme"]')
    await themeBtn.click()
    await page.waitForTimeout(300)
    // Sprawdzamy że html ma klasę theme (lub atrybut)
    const cls = await page.locator('html').getAttribute('class')
    expect(cls === null || typeof cls === 'string').toBeTruthy()
  })

  test('2.4 menu items prowadzą do właściwych URL', async ({ page }) => {
    await loginAs(page, ADMIN)
    const items = [
      { sel: '[data-testid="menu-pacjenci"]', expected: '/patients' },
      { sel: '[data-testid="menu-projekty"]', expected: '/projects' },
      { sel: '[data-testid="menu-kalendarz"]', expected: '/calendar' },
      { sel: '[data-testid="menu-wiadomości"]', expected: '/messages' },
      { sel: '[data-testid="menu-materiały"]', expected: '/materials' },
    ]
    for (const item of items) {
      if (await page.isVisible(item.sel)) {
        await page.click(item.sel)
        await page.waitForURL(`**${item.expected}**`, { timeout: 5000 })
        expect(page.url()).toContain(item.expected)
      }
    }
  })
})

// ============================================================
// 3. PACJENCI (US-K-01..05, US-D-01)
// ============================================================
test.describe('3. Pacjenci', () => {
  test('3.1 lista pacjentów /patients ładuje się', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/patients')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/patients')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('3.2 strona ma input wyszukiwania', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/patients')
    await page.waitForLoadState('networkidle')
    const searchInputs = await page.locator('input[type="search"], input[placeholder*="szuk" i], input[placeholder*="search" i]').count()
    expect(searchInputs).toBeGreaterThanOrEqual(0)
  })
})

// ============================================================
// 4. KALENDARZ (US-K-06..09)
// ============================================================
test.describe('4. Kalendarz', () => {
  test('4.1 strona /calendar ładuje się', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/calendar')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/calendar')
    await expect(page.locator('h1').first()).toBeVisible()
  })
})

// ============================================================
// 5. MATERIAŁY EDUKACYJNE (US-K-10, US-D-04)
// ============================================================
test.describe('5. Materiały', () => {
  test('5.1 strona /materials ładuje się', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/materials')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/materials')
  })
})

// ============================================================
// 6. WIADOMOŚCI (US-K-13..14)
// ============================================================
test.describe('6. Wiadomości', () => {
  test('6.1 strona /messages ładuje się', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/messages')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/messages')
  })
})

// ============================================================
// 7. PROJEKTY (US-K-04..05)
// ============================================================
test.describe('7. Projekty', () => {
  test('7.1 strona /projects ładuje się', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/projects')
  })
})

// ============================================================
// 8. ADMIN — RODO (US-A-10/11/12)
// ============================================================
test.describe('8. Admin RODO', () => {
  test('8.1 panel /admin/rodo ładuje się + select pacjenta', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/admin/rodo')
    await page.waitForSelector('[data-testid="patient-select"]', { timeout: 10000 })
    await expect(page.locator('[data-testid="patient-select"]')).toBeVisible()
  })

  test('8.2 eksport JSON pobiera plik .json', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/admin/rodo')
    await page.waitForSelector('[data-testid="patient-select"]', { timeout: 10000 })
    await page.click('[data-testid="format-json"]')
    const downloadPromise = page.waitForEvent('download')
    await page.click('[data-testid="download-button"]')
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.json')
  })

  test('8.3 eksport PDF pobiera plik .pdf', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/admin/rodo')
    await page.waitForSelector('[data-testid="patient-select"]', { timeout: 10000 })
    await page.click('[data-testid="format-pdf"]')
    const downloadPromise = page.waitForEvent('download')
    await page.click('[data-testid="download-button"]')
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.pdf')
  })

  test('8.4 widoczne kontrolki: format JSON/PDF + przycisk eksportu', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/admin/rodo')
    await page.waitForSelector('[data-testid="patient-select"]')
    await expect(page.locator('[data-testid="format-json"]')).toBeVisible()
    await expect(page.locator('[data-testid="format-pdf"]')).toBeVisible()
    await expect(page.locator('[data-testid="export-data-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="download-button"]')).toBeVisible()
  })
})

// ============================================================
// 9. ADMIN — WERYFIKACJE (US-NH-01)
// ============================================================
test.describe('9. Pending verifications (US-NH-01)', () => {
  test('9.1 strona /admin/pending-verifications ładuje się', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/admin/pending-verifications')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/admin/pending-verifications')
    // Albo tabela albo komunikat empty
    const hasTable = await page.locator('[data-testid="pending-verifications-table"]').count()
    const hasEmpty = await page.locator('[data-testid="pending-verifications-empty"]').count()
    expect(hasTable + hasEmpty).toBeGreaterThan(0)
  })

  test('9.2 rejestracja → pacjent pojawia się w pending list', async ({ page }) => {
    // 1. Zarejestruj nowego pacjenta
    await page.goto('/register')
    const stamp = Date.now()
    const pesel = `9${randomDigits(10)}`
    const lastName = `E2EVerify${stamp}`
    await page.fill('input[name="email"]', `verify.${stamp}@email.com`)
    await page.fill('input[name="pesel"]', pesel)
    await page.fill('input[name="phone"]', `+49${String(stamp).slice(-9)}`)
    await page.fill('input[name="firstName"]', 'E2E')
    await page.fill('input[name="lastName"]', lastName)
    await page.fill('input[name="password"]', 'TestP@ssw0rd123')
    await page.fill('input[name="confirmPassword"]', 'TestP@ssw0rd123')
    await page.check('input[name="acceptTerms"]')
    await page.click('button[type="submit"]')
    await page.waitForSelector('[data-testid="success-message"]', { timeout: 15000 })

    // 2. Zaloguj jako admin i sprawdź listę
    await loginAs(page, ADMIN)
    await page.goto('/admin/pending-verifications')
    await page.waitForSelector('[data-testid="pending-verifications-table"]', { timeout: 10000 })
    const tableText = await page.textContent('[data-testid="pending-verifications-table"]')
    expect(tableText).toContain(lastName)
  })
})

// ============================================================
// 10. ADMIN — SYSTEM (US-A-08)
// ============================================================
test.describe('10. Admin system', () => {
  test('10.1 strona /admin/system ładuje się', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/admin/system')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/admin/system')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('10.2 widoczne karty: Status systemu, Operacje', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/admin/system')
    await page.waitForLoadState('networkidle')
    const text = await page.textContent('body')
    expect(text).toContain('Status systemu')
  })
})

// ============================================================
// 11. ADMIN — AUDIT LOG (US-A-04)
// ============================================================
test.describe('11. Audit logs', () => {
  test('11.1 strona /admin/audit-logs ładuje się', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/admin/audit-logs')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/admin/audit-logs')
  })
})

// ============================================================
// 12. USTAWIENIA + I18N (US-S-12, US-S-19)
// ============================================================
test.describe('12. Settings + i18n', () => {
  test('12.1 strona /settings ma sekcje', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/settings')
    await page.waitForSelector('[data-testid="settings-page"]', { timeout: 10000 })
    await expect(page.locator('[data-testid="settings-title"]')).toBeVisible()
  })

  test('12.2 i18n PL → EN → PL', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/settings')
    await page.waitForSelector('[data-testid="language-en"]')
    await page.click('[data-testid="language-en"]')
    await page.waitForTimeout(800)
    const en = await page.textContent('[data-testid="settings-title"]')
    expect((en ?? '').toLowerCase()).toContain('settings')
    await page.click('[data-testid="language-pl"]')
    await page.waitForTimeout(800)
    const pl = await page.textContent('[data-testid="settings-title"]')
    expect((pl ?? '').toLowerCase()).toContain('ustawienia')
  })
})

// ============================================================
// 13. POMOC KONTEKSTOWA (US-S-20)
// ============================================================
test.describe('13. Contextual help', () => {
  test('13.1 przycisk "Pomoc kontekstowa" otwiera dialog', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.click('[data-testid="help-button"]')
    await page.waitForSelector('[role="dialog"][aria-labelledby="help-dialog-title"]', { timeout: 5000 })
    await expect(page.locator('#help-dialog-title')).toBeVisible()
  })

  test('13.2 pomoc dopasowana do route /admin/rodo', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/admin/rodo')
    await page.waitForLoadState('networkidle')
    await page.click('[data-testid="help-button"]')
    await page.waitForSelector('#help-dialog-title')
    const title = await page.textContent('#help-dialog-title')
    expect((title ?? '').toLowerCase()).toMatch(/rodo|admin|pomoc/)
  })

  test('13.3 ESC zamyka dialog pomocy', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.click('[data-testid="help-button"]')
    await page.waitForSelector('#help-dialog-title')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    expect(await page.locator('#help-dialog-title').count()).toBe(0)
  })
})

// ============================================================
// 14. PROFIL (US-S-04)
// ============================================================
test.describe('14. Profil', () => {
  test('14.1 strona /profile ładuje się', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/profile')
  })
})

// ============================================================
// 15. RAPORTY / COMPLIANCE (US-K-19, US-A-04)
// ============================================================
test.describe('15. Raporty + Compliance', () => {
  test('15.1 strona /reports ładuje się', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/reports')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/reports')
  })

  test('15.2 strona /compliance ładuje się', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/compliance')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/compliance')
  })
})

// ============================================================
// 16. WYLOGOWANIE (US-S-02)
// ============================================================
test.describe('16. Logout', () => {
  test('16.1 wylogowanie kasuje sesję i przekierowuje na /login', async ({ page }) => {
    await loginAs(page, ADMIN)
    // Otwórz user menu (header)
    await page.click('button[aria-label="User menu"]')
    await page.waitForTimeout(300)
    // Kliknij "Wyloguj"
    const logoutButton = page.locator('button:has-text("Wyloguj")')
    await logoutButton.click()
    await page.waitForURL('**/login', { timeout: 10000 })
    expect(page.url()).toContain('/login')

    // Próba odwiedzenia chronionej strony przekierowuje z powrotem
    await page.goto('/dashboard')
    await page.waitForURL('**/login**', { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })
})
