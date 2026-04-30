# KPTEST — UX / Material Design audit (US-S-16)

Data audytu: 2026-04-29
Zakres: portal web (`frontend/src/`), heurystyka spojnosci design systemu.

## 1. UI Kit — komponenty wspoldzielone

Lokalizacja: `frontend/src/shared/components/`

| Komponent              | Rola                                      |
| ---------------------- | ----------------------------------------- |
| `Button.tsx`           | Standardowy przycisk (varianty + sizes)   |
| `IconButton.tsx`       | Ikonowy przycisk (akcje pomocnicze)       |
| `Input.tsx`            | Pole formularza (typed wrapper)           |
| `Card.tsx`             | Kontener prezentacyjny                    |
| `DataTable.tsx`        | Tabela z sortowaniem / paginacja          |
| `Charts.tsx`           | Wrapper na wykresy (line/bar/pie)         |
| `ExportButton.tsx`     | CTA dla eksportu CSV/PDF                  |
| `PageLoader.tsx`       | Overlay ladowania dla calej strony        |
| `ErrorBoundary.tsx`    | React error boundary                      |
| `ProtectedRoute.tsx`   | Guard dla tras autoryzowanych             |
| `PublicRoute.tsx`      | Guard dla tras publicznych                |
| `Stubs.tsx`            | Empty-state / placeholder UI              |
| `index.ts`             | Re-export barrel                          |

Razem: 12 komponentow + barrel index.

## 2. Design tokens (Tailwind)

Konfiguracja `frontend/tailwind.config.js` definiuje skale kolorow:
- `primary` (Blue 50-950) — zaufanie, akcje glowne
- `secondary` (Teal 50-950) — uspokajajace, healing
- `accent` (Red 50-950) — alerty, urgency
- `success` (Green 50-950) — pozytywne stany
- `warning` (Amber 50-950) — ostrzezenia
- `error` (Red 50-950) — bledy, destrukcyjne akcje
- `neutral` (Gray 50-950) — szarosci

Typografia (skala uzyta w kodzie): `text-xs`, `text-sm`, `text-base`,
`text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`. Brak
`text-5xl` / `text-6xl` w produkcji — skala kontrolowana.

Wagi fontu uzyte: `font-medium`, `font-semibold`, `font-bold`. Brak
`font-light`, `font-thin`, `font-extrabold` — skala konsekwentna.

## 3. Statystyki heurystyczne

| Metryka                                                              | Wartosc      |
| -------------------------------------------------------------------- | ------------ |
| `<Button>` z UI Kit (uzycia)                                         | 141          |
| Surowe `<button>` poza UI Kitem (uzycia)                             | 6            |
| Stosunek UI-Kit Button vs raw `<button>`                             | 24:1         |
| `style={{ ... }}` (inline style)                                     | 22           |
| Pliki z inline style                                                 | 14           |
| Unikalne klasy `bg-<palette>-<n>`                                    | 64           |
| Unikalne klasy `text-<palette>-<n>`                                  | 56           |
| Unikalne wartosci `text-<size>` (rozmiar fontu)                      | 8            |
| Unikalne wartosci `font-<weight>`                                    | 3            |

## 4. Lokalizacje surowych `<button>` (out-of-kit)

1. `features/materials/ui/MaterialViewerPage.tsx:71` — close button po bledzie
2. `features/reports/ui/ExportModal.tsx:117` — modal close (X)
3. `shared/components/IconButton.tsx:85` — wewnatrz IconButton (zamierzone)
4. `features/admin/ui/AdminDashboard.tsx:299` — link "Zobacz wszystkie"
5. `features/reports/ui/ComplianceDashboard.tsx:475` — akcja w wierszu tabeli
6. `features/reports/ui/ComplianceDashboard.tsx:478` — akcja w wierszu tabeli

5 z 6 to zamierzone uproszczenia (linki text-only) lub wewnetrzna implementacja
IconButton. Realny "out-of-kit" to ~5 punktow do refaktoru.

## 5. Inline-style — analiza

22 wystapienia `style={{}}` rozmieszczone w 14 plikach. Praktycznie
wszystkie to dynamiczne wartosci, ktorych Tailwind nie obsluguje statycznie:

- Progress bar `width: ${percent}%` — 11 przypadkow (DashboardKpiCard, ProgressTracker, ComplianceDashboard, ProjectPatientsPage, AttachmentUpload, ComplianceChart, SystemMetricsChart, ProjectStatistics, Stubs, ProjectStatsCard)
- `height: ${chartHeight}px` — 4 przypadki (Charts, ComplianceDashboard, ComplianceChart)
- `backgroundColor: slice.color` — 1 (Charts.tsx, dynamiczny kolor pie-slice)
- `width: column.width` — 1 (DataTable, dynamiczna szerokosc kolumny)
- `borderTop: '2px dashed #f59e0b'` — 1 (ComplianceChart, hardcoded color zamiast palette)
- `minHeight: '44px'` — 1 (MessageInput)
- BadgeCard.tsx — 1 (gradient background z gamification)

**Werdykt:** Wszystkie poza 1-2 (BadgeCard gradient, ComplianceChart
hardcoded `#f59e0b`) to legitne dynamic styles. Realny technical debt: ~3
przypadki gdzie hardcoded kolor powinien byc tokenem palette.

## 6. Liczba kolorow — czy paleta jest kontrolowana?

64 unikalnych klas `bg-*-N` to duzo, ale nalezy uwzglednic szerokosc skali (50,
100, 200, ..., 900 = 10 odcieni x ~6-8 palet = naturalnie 60+). Faktyczne
palety w uzyciu:
- `primary` (8 odcieni) — OK
- `neutral` (6 odcieni) — OK
- `gray` (4 odcienie) — **DUPLIKAT** wzgledem `neutral` (Tailwind default vs token)
- `rose` (5 odcieni) — uzywany dla wybranych akcentow
- `amber`, `green`, `blue`, `red`, `yellow`, `emerald`, `orange`, `purple`, `indigo`, `cyan`, `violet` — **fragmentacja**

Zauwazono ze niektore feature uzywaja `red-*` zamiast `error-*` /
`accent-*`, `green-*` zamiast `success-*`, `blue-*` zamiast `primary-*`.

## 7. Top 5 odstepstw od design systemu

1. **Fragmentacja palety semantycznej**: pomimo definicji w
   `tailwind.config.js` tokenow `success/warning/error/accent`, wiele plikow
   uzywa surowych palet Tailwind (`green-*`, `red-*`, `yellow-*`, `blue-*`).
2. **Duplikacja `gray` vs `neutral`**: 4 wystapienia `text-gray-*` /
   `bg-gray-*` zamiast `neutral-*`. Powinno byc zunifikowane do `neutral-*`.
3. **Hardcoded color w inline style**: `ComplianceChart.tsx:162` uzywa
   `borderTop: '2px dashed #f59e0b'` (hex) zamiast tokenu `warning-500`.
4. **Out-of-kit `<button>`**: 5 miejsc gdzie zamiast UI Kit `<Button>`
   uzywany jest surowy `<button>` z inline-tailwind classes.
5. **Brak globalnego LanguageSwitchera** (cross-link do US-S-17): widget
   istnieje tylko na `/settings`, brak go w header / sidebar.

## 8. Werdykt

**PASS** (z drobnymi uwagami / NEEDS-WORK na poziomie pojedynczych plikow).

Argumenty za PASS:
- Konsekwentny UI Kit z 12 komponentami i barrel index.
- Stosunek UI-Kit `<Button>` vs surowy `<button>` = **24:1** (96% zgodnosci).
- Inline-style uzywany prawie wylacznie do dynamicznych wartosci (progress
  bars, chart heights), ktorych Tailwind nie wspiera staycznie.
- Skala typografii ograniczona do 8 rozmiarow + 3 wag fontu (kontrolowana).
- Tailwind tokens (`primary/secondary/accent/success/warning/error/neutral`)
  zdefiniowane w configu zgodnie z Material Design / HIG.

Argumenty za NEEDS-WORK (dla follow-up zadania):
- Fragmentacja semantycznej palety (mieszanka `green-*` / `success-*`).
- Duplikat `gray` vs `neutral`.
- Pojedyncze hardcoded kolory hex w inline style.
- Brak globalnego LanguageSwitchera w UI.

## Pliki utworzone w ramach audytu

- `testy_all/ux_design_audit.md` — niniejszy raport.
