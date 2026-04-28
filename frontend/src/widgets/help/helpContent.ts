/**
 * Contextual help articles (US-S-20).
 *
 * Each entry is matched against the current `pathname` prefix. The first
 * entry whose pattern matches wins. Generic fallback at the end.
 */
export interface HelpArticle {
  pattern: RegExp
  title: string
  body: string
  links?: { label: string; href: string }[]
}

export const HELP_ARTICLES: HelpArticle[] = [
  {
    pattern: /^\/dashboard/,
    title: 'Pulpit (Dashboard)',
    body:
      'Pulpit prezentuje skrót aktualnego stanu pracy: liczbę pacjentów, nadchodzące wydarzenia, ' +
      'nieprzeczytane wiadomości oraz ostatnie zgłoszenia RODO. Klikając kafelek przechodzisz ' +
      'do widoku szczegółowego.',
  },
  {
    pattern: /^\/patients/,
    title: 'Zarządzanie pacjentami',
    body:
      'Lista pacjentów obsługiwanych przez placówkę. Możesz wyszukiwać po PESEL/nazwisku, ' +
      'dodawać pacjenta ręcznie lub zaimportować z HIS, generować kody aktywacyjne. ' +
      'Funkcje RODO (eksport, anonimizacja, usunięcie) dostępne dla administratora.',
    links: [
      { label: 'Polityka RODO (Art. 17, 20)', href: '/admin/audit-logs' },
    ],
  },
  {
    pattern: /^\/admin\/system/,
    title: 'Status systemu',
    body:
      'Monitoring zdrowia aplikacji (DB, Redis, dysk), metryki użycia oraz operacje ' +
      'administracyjne (cache, backup). Status DOWN wymaga natychmiastowej reakcji.',
  },
  {
    pattern: /^\/admin\/audit/,
    title: 'Dziennik audytu',
    body:
      'Pełny rejestr operacji RODO, logowań i zmian uprawnień. Wpisów nie można edytować ' +
      'ani usuwać. Eksport CSV dostępny dla wybranego zakresu dat.',
  },
  {
    pattern: /^\/admin/,
    title: 'Panel administratora',
    body:
      'Konfiguracja użytkowników, słowników (US-A-09), monitoringu (US-A-08) i operacji ' +
      'RODO (US-A-10/11/12). Wszystkie akcje są audytowane.',
  },
  {
    pattern: /^\/calendar|^\/appointments/,
    title: 'Kalendarz wydarzeń',
    body:
      'Planowanie wydarzeń terapeutycznych. Konflikty są wykrywane automatycznie. ' +
      'Można ustawić przypomnienia 24h/1h przed wydarzeniem oraz skopiować wydarzenie cykliczne.',
  },
  {
    pattern: /^\/messages|^\/inbox/,
    title: 'Wiadomości',
    body:
      'Komunikacja z pacjentami i wewnątrz zespołu. Wątek można przypisać do innego ' +
      'członka personelu. Załączniki i materiały edukacyjne udostępniasz przyciskiem „Załącz".',
  },
  {
    pattern: /^\/materials/,
    title: 'Materiały edukacyjne',
    body:
      'Biblioteka treści przypisywanych pacjentom lub etapom programu. Obsługiwane formaty: ' +
      'PDF, wideo, link zewnętrzny. Każda zmiana zapisywana jest w audycie.',
  },
  {
    pattern: /^\/settings|^\/profile/,
    title: 'Ustawienia konta',
    body:
      'Zmiana hasła, konfiguracja 2FA (TOTP), preferencje powiadomień, język. ' +
      '2FA zalecane dla wszystkich kont z rolą medyczną.',
  },
]

const FALLBACK: HelpArticle = {
  pattern: /.*/,
  title: 'Pomoc kontekstowa',
  body:
    'Wybierz funkcję z menu, aby zobaczyć dedykowaną pomoc. W razie pytań skontaktuj się ' +
    'z administratorem placówki lub zespołem wsparcia KPTEST.',
}

export const findHelpArticle = (pathname: string): HelpArticle =>
  HELP_ARTICLES.find((a) => a.pattern.test(pathname)) ?? FALLBACK
