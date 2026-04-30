import { test, expect, type Page } from '@playwright/test'

/**
 * KPTEST - E2E i18n switching audit (US-S-17)
 *
 * Sprawdza, czy widget LanguageSwitcher faktycznie zmienia jezyk UI z PL na EN
 * i z EN na PL.
 *
 * Po zadaniu A2 (P5c polish) switcher jest dostepny GLOBALNIE w nagłowku
 * (kompaktowy LangSwitcherCompact, data-testid="lang-switcher-button"),
 * a takze nadal w wariancie inline na stronie /settings
 * (data-testid="language-switcher" + "language-pl"/"language-en" — wariant
 * inline reuzywany przez stara LanguageSwitcher na /settings).
 *
 * UWAGA: spec jest artefaktem audytu — NIE odpalaj playwright recznie tutaj,
 * to ma byc parsowalne przez playwright run jesli ktos go odpali pozniej.
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

    // Inline wariant na /settings (LanguageSwitcher delegujacy do
    // LangSwitcherCompact variant="inline" — testid pozostaje
    // "language-switcher" / "language-pl" / "language-en" dla zachowania
    // wstecznej kompatybilnosci z istniejacymi unit testami).
    const switcher = page.locator('[data-testid="language-switcher"]').first()
    await expect(switcher, 'LanguageSwitcher should be present on /settings').toBeVisible()

    const plBtn = page.locator('[data-testid="language-pl"]').first()
    const enBtn = page.locator('[data-testid="language-en"]').first()

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

  test('global header switcher is present on all main routes', async ({ page }) => {
    await login(page)

    const presence: Array<{ route: string; hasHeaderSwitcher: boolean }> = []
    for (const r of ROUTES) {
      await page.goto(`${BASE_URL}${r}`)
      await page.waitForLoadState('domcontentloaded')
      const cnt = await page.locator('[data-testid="lang-switcher-button"]').count()
      presence.push({ route: r, hasHeaderSwitcher: cnt > 0 })
    }

    test.info().annotations.push({
      type: 'i18n-header-availability',
      description: `LangSwitcherCompact (header) availability: ${JSON.stringify(presence)}`,
    })

    // Po zadaniu A2 switcher MA byc widoczny na kazdej trasie portalu.
    const missing = presence.filter((p) => !p.hasHeaderSwitcher).map((p) => p.route)
    expect(
      missing,
      `Global header LangSwitcherCompact should be present on all main routes; missing on: ${missing.join(', ')}`,
    ).toEqual([])
  })

  test('header switcher toggles document language PL <-> EN', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForLoadState('domcontentloaded')

    const trigger = page.locator('[data-testid="lang-switcher-button"]')
    await expect(trigger, 'Header LangSwitcherCompact button should be visible').toBeVisible()

    // Helper — odczyt biezacego jezyka. Preferowane: <html lang>, fallback:
    // localStorage.i18nextLng (LangSwitcherCompact zapisuje tam wybor).
    const readLang = async (): Promise<string> => {
      const htmlLang = await page.evaluate(() =>
        document.documentElement.getAttribute('lang') || '',
      )
      if (htmlLang) return htmlLang.toLowerCase()
      const ls = await page.evaluate(() => localStorage.getItem('i18nextLng') || '')
      return ls.toLowerCase()
    }

    // Zlap pierwszy widoczny <h1>/<h2> z dashboardu jako proxy dla efektu i18n.
    const heading = page.locator('h1, h2').first()
    const headingBefore = (await heading.count()) > 0 ? await heading.innerText() : ''

    // Switch na EN.
    await trigger.click()
    const enOption = page.locator('[data-testid="lang-option-en"]')
    await expect(enOption).toBeVisible()
    await enOption.click()
    await page.waitForTimeout(300)

    const langAfterEn = await readLang()
    const headingAfterEn = (await heading.count()) > 0 ? await heading.innerText() : ''
    test.info().annotations.push({
      type: 'i18n-header-en',
      description: `lang="${langAfterEn}" | heading="${headingAfterEn}" (before="${headingBefore}")`,
    })
    expect(
      langAfterEn === 'en' || langAfterEn.startsWith('en-') || headingAfterEn !== headingBefore,
      `After clicking EN expected <html lang>=en or heading change; got lang="${langAfterEn}", headingBefore="${headingBefore}", headingAfterEn="${headingAfterEn}"`,
    ).toBeTruthy()

    // Switch z powrotem na PL.
    await trigger.click()
    const plOption = page.locator('[data-testid="lang-option-pl"]')
    await expect(plOption).toBeVisible()
    await plOption.click()
    await page.waitForTimeout(300)

    const langAfterPl = await readLang()
    const headingAfterPl = (await heading.count()) > 0 ? await heading.innerText() : ''
    test.info().annotations.push({
      type: 'i18n-header-pl',
      description: `lang="${langAfterPl}" | heading="${headingAfterPl}"`,
    })
    expect(
      langAfterPl === 'pl' || langAfterPl.startsWith('pl-') || headingAfterPl !== headingAfterEn,
      `After clicking PL expected <html lang>=pl or heading change vs EN; got lang="${langAfterPl}", headingAfterEn="${headingAfterEn}", headingAfterPl="${headingAfterPl}"`,
    ).toBeTruthy()
  })
})
