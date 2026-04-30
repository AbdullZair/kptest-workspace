import { LangSwitcherCompact } from '@widgets/layout/LangSwitcherCompact'

/**
 * LanguageSwitcher Component
 *
 * Allows users to switch between PL and EN languages on /settings page.
 *
 * Thin wrapper around the reusable {@link LangSwitcherCompact} widget with
 * the 'inline' visual variant (two flat PL/EN buttons side by side). The
 * compact 'icon' variant of the same widget is also rendered globally in the
 * header (US-S-17 polish — globally available language switching).
 */
export const LanguageSwitcher = (): JSX.Element => {
  return <LangSwitcherCompact variant="inline" />
}
