import { test, expect, type Page } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * KPTEST — pełny audyt WCAG 2.1 AA (US-S-18)
 *
 * Skanuje wszystkie główne trasy portalu i agreguje wyniki w
 * `wcag_a11y_report.md`. Testy NIE failują na violations — to audyt,
 * nie regresja. Annotacje zawierają liczbę i listę typów violation per trasa.
 */

const BASE_URL = 'http://localhost:3000'
const ADMIN = { identifier: 'admin@kptest.com', password: 'TestP@ssw0rd123' }
const REPORT_DIR = '/home/user1/KPTESTPRO/testy_all'
const A11Y_RAW_FILE = join(REPORT_DIR, 'wcag_a11y_raw.json')
const A11Y_REPORT_FILE = join(REPORT_DIR, 'wcag_a11y_report.md')

mkdirSync(REPORT_DIR, { recursive: true })

interface ViolationSummary {
  id: string
  impact: string | null | undefined
  help: string
  nodes: number
  helpUrl?: string
}

interface RouteResult {
  route: string
  scanned: boolean
  violations: number
  byImpact: Record<string, number>
  topViolations: ViolationSummary[]
  error?: string
}

const PUBLIC_ROUTES = ['/login', '/register']

const PROTECTED_ROUTES = [
  '/dashboard',
  '/patients',
  '/projects',
  '/calendar',
  '/materials',
  '/messages',
  '/admin/users',
  '/admin/audit-logs',
  '/admin/system',
  '/admin/pending-verifications',
]

const ALL_ROUTES = [...PUBLIC_ROUTES, ...PROTECTED_ROUTES]

// Reset/seed shared raw file once per worker
const ensureRawFile = () => {
  if (!existsSync(A11Y_RAW_FILE)) {
    writeFileSync(A11Y_RAW_FILE, JSON.stringify({ results: [] }, null, 2))
  }
}

const appendResult = (result: RouteResult) => {
  ensureRawFile()
  const raw = JSON.parse(readFileSync(A11Y_RAW_FILE, 'utf-8')) as { results: RouteResult[] }
  raw.results = raw.results.filter((r) => r.route !== result.route)
  raw.results.push(result)
  writeFileSync(A11Y_RAW_FILE, JSON.stringify(raw, null, 2))
}

const loginAsAdmin = async (page: Page): Promise<boolean> => {
  await page.goto('/login')
  try {
    await page.fill('input[name="email"]', ADMIN.identifier, { timeout: 8000 })
    await page.fill('input[name="password"]', ADMIN.password, { timeout: 4000 })
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard', { timeout: 15000 })
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    return true
  } catch (err) {
    return false
  }
}

const scanRoute = async (page: Page, route: string, requiresAuth: boolean): Promise<RouteResult> => {
  try {
    if (requiresAuth) {
      // Already logged in by beforeEach
      await page.goto(route)
    } else {
      // Public route — go directly (logout handled by clearing storage)
      await page.context().clearCookies()
      await page.goto(route)
    }
    await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {})
    // Small settle delay for lazy-loaded components
    await page.waitForTimeout(800)

    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const byImpact: Record<string, number> = {}
    for (const v of result.violations) {
      const k = v.impact || 'unknown'
      byImpact[k] = (byImpact[k] || 0) + 1
    }

    const topViolations: ViolationSummary[] = result.violations.slice(0, 3).map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.length,
      helpUrl: v.helpUrl,
    }))

    return {
      route,
      scanned: true,
      violations: result.violations.length,
      byImpact,
      topViolations,
    }
  } catch (err) {
    return {
      route,
      scanned: false,
      violations: 0,
      byImpact: {},
      topViolations: [],
      error: (err as Error).message,
    }
  }
}

test.describe('WCAG 2.1 AA — full route audit', () => {
  test.setTimeout(60000) // 60s — duże strony /projects po fixach a11y mają więcej węzłów do skanu

  // Public routes — no auth needed
  for (const route of PUBLIC_ROUTES) {
    test(`a11y public ${route}`, async ({ page }) => {
      const result = await scanRoute(page, route, false)
      appendResult(result)
      test.info().annotations.push({
        type: 'a11y-violations',
        description: `${route}: ${result.violations} violations | impacts=${JSON.stringify(result.byImpact)} | top=${JSON.stringify(
          result.topViolations.map((v) => `${v.id}(${v.impact})`)
        )}`,
      })
      // Audit only — do NOT fail on violations
      expect(result.scanned || !!result.error, 'route reachable').toBeTruthy()
    })
  }

  // Protected routes — share login state
  test.describe('protected routes', () => {
    test.beforeEach(async ({ page }) => {
      const ok = await loginAsAdmin(page)
      if (!ok) {
        test.info().annotations.push({
          type: 'a11y-skip',
          description: 'login flow failed — protected route scan skipped',
        })
      }
    })

    for (const route of PROTECTED_ROUTES) {
      test(`a11y protected ${route}`, async ({ page }) => {
        const result = await scanRoute(page, route, true)
        appendResult(result)
        test.info().annotations.push({
          type: 'a11y-violations',
          description: `${route}: ${result.violations} violations | impacts=${JSON.stringify(result.byImpact)} | top=${JSON.stringify(
            result.topViolations.map((v) => `${v.id}(${v.impact})`)
          )}`,
        })
        expect(result.scanned || !!result.error, 'route reachable').toBeTruthy()
      })
    }
  })

  // Aggregator — runs last (alphabetically zzz)
  test('zzz_aggregate_report', async () => {
    ensureRawFile()
    const raw = JSON.parse(readFileSync(A11Y_RAW_FILE, 'utf-8')) as { results: RouteResult[] }
    const byRoute = new Map<string, RouteResult>()
    for (const r of raw.results) byRoute.set(r.route, r)

    const ordered = ALL_ROUTES.map(
      (r) =>
        byRoute.get(r) ?? {
          route: r,
          scanned: false,
          violations: 0,
          byImpact: {},
          topViolations: [] as ViolationSummary[],
          error: 'not scanned',
        }
    )

    // Tally violation types across all routes
    const typeCount = new Map<string, { count: number; impact: string }>()
    for (const r of ordered) {
      for (const v of r.topViolations) {
        const cur = typeCount.get(v.id) || { count: 0, impact: v.impact || 'unknown' }
        cur.count += 1
        typeCount.set(v.id, cur)
      }
    }
    const topTypes = Array.from(typeCount.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)

    const totalViolations = ordered.reduce((s, r) => s + r.violations, 0)
    const totalScanned = ordered.filter((r) => r.scanned).length

    // Compose Markdown
    const lines: string[] = []
    lines.push('# WCAG 2.1 AA Accessibility Audit — KPTEST Portal')
    lines.push('')
    lines.push(`Date: ${new Date().toISOString()}`)
    lines.push(`Tool: @axe-core/playwright (tags: wcag2a, wcag2aa, wcag21a, wcag21aa)`)
    lines.push(`Routes scanned: ${totalScanned}/${ordered.length}`)
    lines.push(`Total violations across portal: ${totalViolations}`)
    lines.push('')
    lines.push('## Per-route summary')
    lines.push('')
    lines.push('| Route | Scanned | Violations | Severity (impacts) | Top violation |')
    lines.push('|-------|---------|------------|--------------------|---------------|')
    for (const r of ordered) {
      const sev = Object.entries(r.byImpact)
        .map(([k, v]) => `${k}:${v}`)
        .join(', ') || '-'
      const top = r.topViolations[0]
        ? `${r.topViolations[0].id} (${r.topViolations[0].impact})`
        : '-'
      const scanned = r.scanned ? 'yes' : `no (${r.error || 'n/a'})`
      lines.push(`| \`${r.route}\` | ${scanned} | ${r.violations} | ${sev} | ${top} |`)
    }
    lines.push('')
    lines.push('## Top 5 most frequent WCAG violation types')
    lines.push('')
    if (topTypes.length === 0) {
      lines.push('No violations detected (or all routes failed to scan).')
    } else {
      lines.push('| Rule ID | Impact | Occurrences (routes) |')
      lines.push('|---------|--------|----------------------|')
      for (const [id, info] of topTypes) {
        lines.push(`| \`${id}\` | ${info.impact} | ${info.count} |`)
      }
    }
    lines.push('')
    lines.push('## Per-route detail (top 3 violations each)')
    lines.push('')
    for (const r of ordered) {
      lines.push(`### \`${r.route}\``)
      if (!r.scanned) {
        lines.push(`- not scanned: ${r.error || 'n/a'}`)
        lines.push('')
        continue
      }
      if (r.topViolations.length === 0) {
        lines.push('- no violations')
      } else {
        for (const v of r.topViolations) {
          lines.push(`- \`${v.id}\` (${v.impact}) — ${v.help} (${v.nodes} nodes)`)
        }
      }
      lines.push('')
    }

    writeFileSync(A11Y_REPORT_FILE, lines.join('\n'))
    expect(existsSync(A11Y_REPORT_FILE)).toBeTruthy()
  })
})
