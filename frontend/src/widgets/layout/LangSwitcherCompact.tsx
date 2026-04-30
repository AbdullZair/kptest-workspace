import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { clsx } from 'clsx'

/**
 * LangSwitcherCompact props
 */
interface LangSwitcherCompactProps {
  /**
   * Visual variant:
   * - 'icon' (default): compact globe icon with dropdown — header/topbar usage.
   * - 'inline': two flat PL/EN buttons next to each other — settings page usage.
   */
  variant?: 'icon' | 'inline'
}

type SupportedLang = 'pl' | 'en'

/**
 * Determines whether the current i18n language matches a target SupportedLang.
 * Handles regional codes like 'pl-PL', 'en-US', 'en-GB'.
 */
const isLangActive = (current: string, target: SupportedLang): boolean => {
  return current === target || current.toLowerCase().startsWith(`${target}-`)
}

/**
 * LangSwitcherCompact
 *
 * Reusable language switcher widget. Two visual variants:
 * - 'icon': globe icon with a dropdown listing PL/EN — used in the global header (US-S-17).
 * - 'inline': flat side-by-side PL/EN buttons — used on /settings page.
 *
 * In both cases it calls i18n.changeLanguage and persists the choice to localStorage.
 * The chosen language is highlighted. Buttons expose data-testid + aria-label
 * (US-S-18 a11y).
 */
export const LangSwitcherCompact: React.FC<LangSwitcherCompactProps> = ({ variant = 'icon' }) => {
  const { i18n, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const changeLanguage = (lng: SupportedLang): void => {
    void i18n.changeLanguage(lng)
    try {
      localStorage.setItem('i18nextLng', lng)
    } catch {
      // localStorage may be unavailable (private mode); ignore.
    }
    // Synchronize <html lang> for screen-readers + e2e tests.
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lng
    }
    setIsOpen(false)
  }

  // Close dropdown on outside click (icon variant only).
  useEffect(() => {
    if (variant !== 'icon' || !isOpen) return
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, variant])

  // Close dropdown on Escape (icon variant only).
  useEffect(() => {
    if (variant !== 'icon' || !isOpen) return
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, variant])

  const plActive = isLangActive(i18n.language, 'pl')
  const enActive = isLangActive(i18n.language, 'en')

  if (variant === 'inline') {
    return (
      <div className="flex gap-2" data-testid="language-switcher">
        <button
          aria-pressed={plActive}
          className={clsx(
            'rounded-md px-3 py-1 text-sm font-medium transition-colors',
            plActive
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          )}
          data-testid="language-pl"
          type="button"
          onClick={() => changeLanguage('pl')}
        >
          PL
        </button>
        <button
          aria-pressed={enActive}
          className={clsx(
            'rounded-md px-3 py-1 text-sm font-medium transition-colors',
            enActive
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          )}
          data-testid="language-en"
          type="button"
          onClick={() => changeLanguage('en')}
        >
          EN
        </button>
      </div>
    )
  }

  // Default: icon variant
  const ariaLabel = t('common.languageSwitcher', { defaultValue: 'Wybierz język' })
  const currentLabel = plActive ? 'PL' : enActive ? 'EN' : i18n.language.toUpperCase()

  return (
    <div ref={containerRef} className="relative" data-testid="language-switcher">
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={ariaLabel}
        className="flex items-center gap-1 rounded-lg p-2 transition-colors hover:bg-neutral-100"
        data-testid="lang-switcher-button"
        title={ariaLabel}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {/* Globe icon (Heroicons globe-alt) */}
        <svg
          aria-hidden="true"
          className="h-5 w-5 text-neutral-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 000 18M12.5 3a17 17 0 010 18M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
        <span className="text-xs font-semibold uppercase text-neutral-700">{currentLabel}</span>
      </button>

      {isOpen ? (
        <div
          aria-label={ariaLabel}
          className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-32 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg duration-100"
          role="menu"
        >
          <button
            aria-checked={plActive}
            className={clsx(
              'flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-neutral-50',
              plActive ? 'font-semibold text-primary-700' : 'text-neutral-700'
            )}
            data-testid="lang-option-pl"
            role="menuitemradio"
            type="button"
            onClick={() => changeLanguage('pl')}
          >
            <span>PL</span>
            {plActive ? (
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ) : null}
          </button>
          <button
            aria-checked={enActive}
            className={clsx(
              'flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-neutral-50',
              enActive ? 'font-semibold text-primary-700' : 'text-neutral-700'
            )}
            data-testid="lang-option-en"
            role="menuitemradio"
            type="button"
            onClick={() => changeLanguage('en')}
          >
            <span>EN</span>
            {enActive ? (
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ) : null}
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default LangSwitcherCompact
