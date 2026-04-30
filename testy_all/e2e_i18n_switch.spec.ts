import { test, expect, type Page } from '@playwright/test'

/**
 * KPTEST - E2E i18n switching audit (US-S-17)
 *
 * Sprawdza, czy widget LanguageSwitcher (data-testid="language-switcher")
 * faktycznie zmienia jezyk UI z PL na EN i z EN na PL.
 *
 * UWAGA: switcher jest dostepny tylko na stronie /settings.
 * Inne strony nie maja widocznego switchera w header / sidebar
 * w obecnej wersji (gap zaadnotowany w testy_all/i18n_audit_report.md).
 *
 * Te testy sa "soft" - rejestruja gap zamiast failowac jesli switcher
 * nie jest osiagalny z innych tras. NIE odpalaj playwright; spec jest
 * artefaktem audytu (P5c) - ma byc parsowalny przez playwright run
 * jesli ktos go odpali pozniej.
 */

const BASE_URL = 'http://localhost:3000'
const ADMIN = { identifier: 'admin@kptest.com', password: 'TestP@ssw0rd123' }
const ROUTES = ['/dashboard', '/patients', '/projects', '/materials', '/admin/users']

async function login(page: Page) {
  await page.goto(`${BASE_URL}/login`)
  await page.waitForLoadState('domcontentloaded')
  // Pole identyfikatora: input[name="identifier"] lub email
  const identifierField = page.locator(
    'input[name="identifier"], input[name="email"], input[type="email"]',
  ).first()
  await identifierField.fill(ADMIN.identifier)
  await page.locator('input[type="password"]').first().fill(ADMIN.password)
  await page.locator('button[type="submit"]').first().click()
  await page.waitForURL(/.*\/(dashboard|home|admin).*/, { timeout: 15_000 })
}

test.describe('US-S-17 — Language switcher i18n audit', () => {
  test('switcher exists on /settings and toggles UI from PL to EN', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE_URL}/settings`)
    await page.waitForLoadState('domcontentloaded')

    const switcher = page.locator('[data-testid="language-switcher"]')
    await expect(switcher, 'LanguageSwitcher should be present on /settings').toBeVisible()

    const plBtn = page.locator('[data-testid="language-pl"]')
    const enBtn = page.locator('[data-testid="language-en"]')

    // Wymusza PL na start.
    await plBtn.click()
    await page.waitForTimeout(200)
    const headingPl = await page.locator('h1, h2').first().innerText()

    // Przelacznik na EN.
    await enBtn.click()
    await page.waitForTimeout(200)
    const headingEn = await page.locator('h1, h2').first().innerText()

    // Asercja: cos sie zmienilo. Akceptujemy ze polskie i angielskie naglowki
    // moga sie pokrywac dla "Settings" / "Ustawienia", wiec zalozenie minimalne:
    // przynajmniej jeden przelacznik jezyka skutkuje rozna trescia w PL vs EN.
    expect(headingPl.length).toBeGreaterThan(0)
    expect(headingEn.length).toBeGreaterThan(0)
    test.info().annotations.push({
      type: 'i18n-switch',
      description: `PL heading="${headingPl}" | EN heading="${headingEn}"`,
    })
    expect(
      headingPl !== headingEn,
      `Heading should differ across PL/EN (was "${headingPl}" vs "${headingEn}")`,
    ).toBeTruthy()
  })

  test('language switcher is NOT present on main routes (UI gap)', async ({ page }) => {
    await login(page)

    const gaps: Array<{ route: string; hasSwitcher: boolean }> = []
    for (const r of ROUTES) {
      await page.goto(`${BASE_URL}${r}`)
      await page.waitForLoadState('domcontentloaded')
      const cnt = await page.locator('[data-testid="language-switcher"]').count()
      gaps.push({ route: r, hasSwitcher: cnt > 0 })
    }

    test.info().annotations.push({
      type: 'i18n-gap',
      description: `LanguageSwitcher availability: ${JSON.stringify(gaps)}`,
    })

    // Audyt, nie regresja: nie failujemy, tylko logujemy.
    const withoutSwitcher = gaps.filter((g) => !g.hasSwitcher).map((g) => g.route)
    if (withoutSwitcher.length > 0) {
      test.info().annotations.push({
        type: 'gap',
        description: `LanguageSwitcher missing on: ${withoutSwitcher.join(', ')} — only available on /settings`,
      })
    }
    expect(gaps.length).toBe(ROUTES.length)
  })
})
