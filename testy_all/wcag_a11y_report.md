# WCAG 2.1 AA Accessibility Audit — KPTEST Portal

Date: 2026-04-29T14:10:33.239Z
Tool: @axe-core/playwright (tags: wcag2a, wcag2aa, wcag21a, wcag21aa)
Routes scanned: 12/12
Total violations across portal: 4

## Per-route summary

| Route | Scanned | Violations | Severity (impacts) | Top violation |
|-------|---------|------------|--------------------|---------------|
| `/login` | yes | 0 | - | - |
| `/register` | yes | 0 | - | - |
| `/dashboard` | yes | 1 | serious:1 | color-contrast (serious) |
| `/patients` | yes | 0 | - | - |
| `/projects` | yes | 0 | - | - |
| `/calendar` | yes | 0 | - | - |
| `/materials` | yes | 0 | - | - |
| `/messages` | yes | 0 | - | - |
| `/admin/users` | yes | 0 | - | - |
| `/admin/audit-logs` | yes | 0 | - | - |
| `/admin/system` | yes | 3 | serious:3 | color-contrast (serious) |
| `/admin/pending-verifications` | yes | 0 | - | - |

## Top 5 most frequent WCAG violation types

| Rule ID | Impact | Occurrences (routes) |
|---------|--------|----------------------|
| `color-contrast` | serious | 2 |
| `definition-list` | serious | 1 |
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
- no violations

### `/calendar`
- no violations

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
- `definition-list` (serious) — <dl> elements must only directly contain properly-ordered <dt> and <dd> groups, <script>, <template> or <div> elements (1 nodes)
- `dlitem` (serious) — <dt> and <dd> elements must be contained by a <dl> (2 nodes)

### `/admin/pending-verifications`
- no violations
