# WCAG 2.1 AA Accessibility Audit — KPTEST Portal

Date: 2026-04-29T13:10:01.966Z
Tool: @axe-core/playwright (tags: wcag2a, wcag2aa, wcag21a, wcag21aa)
Routes scanned: 12/12
Total violations across portal: 7

## Per-route summary

| Route | Scanned | Violations | Severity (impacts) | Top violation |
|-------|---------|------------|--------------------|---------------|
| `/login` | yes | 0 | - | - |
| `/register` | yes | 0 | - | - |
| `/dashboard` | yes | 1 | serious:1 | color-contrast (serious) |
| `/patients` | yes | 0 | - | - |
| `/projects` | yes | 2 | critical:1, serious:1 | button-name (critical) |
| `/calendar` | yes | 2 | critical:2 | button-name (critical) |
| `/materials` | yes | 0 | - | - |
| `/messages` | yes | 0 | - | - |
| `/admin/users` | yes | 0 | - | - |
| `/admin/audit-logs` | yes | 0 | - | - |
| `/admin/system` | yes | 2 | serious:2 | color-contrast (serious) |
| `/admin/pending-verifications` | yes | 0 | - | - |

## Top 5 most frequent WCAG violation types

| Rule ID | Impact | Occurrences (routes) |
|---------|--------|----------------------|
| `color-contrast` | serious | 2 |
| `button-name` | critical | 2 |
| `nested-interactive` | serious | 1 |
| `select-name` | critical | 1 |
| `dlitem` | serious | 1 |

## Per-route detail (top 3 violations each)

### `/login`
- no violations

### `/register`
- no violations

### `/dashboard`
- `color-contrast` (serious) — Elements must meet minimum color contrast ratio thresholds (3 nodes)

### `/patients`
- no violations

### `/projects`
- `button-name` (critical) — Buttons must have discernible text (200 nodes)
- `nested-interactive` (serious) — Interactive controls must not be nested (100 nodes)

### `/calendar`
- `button-name` (critical) — Buttons must have discernible text (2 nodes)
- `select-name` (critical) — Select element must have an accessible name (2 nodes)

### `/materials`
- no violations

### `/messages`
- no violations

### `/admin/users`
- no violations

### `/admin/audit-logs`
- no violations

### `/admin/system`
- `color-contrast` (serious) — Elements must meet minimum color contrast ratio thresholds (1 nodes)
- `dlitem` (serious) — <dt> and <dd> elements must be contained by a <dl> (33 nodes)

### `/admin/pending-verifications`
- no violations
