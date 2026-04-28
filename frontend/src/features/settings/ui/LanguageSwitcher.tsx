import { useTranslation } from 'react-i18next'

/**
 * LanguageSwitcher Component
 *
 * Allows users to switch between PL and EN languages
 */
export const LanguageSwitcher = () => {
  const { i18n } = useTranslation()

  const changeLanguage = (lng: 'pl' | 'en') => {
    i18n.changeLanguage(lng)
    localStorage.setItem('i18nextLng', lng)
  }

  return (
    <div className="flex gap-2" data-testid="language-switcher">
      <button
        onClick={() => changeLanguage('pl')}
        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          i18n.language === 'pl' || i18n.language === 'pl-PL'
            ? 'bg-primary-600 text-white'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
        }`}
        data-testid="language-pl"
      >
        PL
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          i18n.language === 'en' || i18n.language === 'en-US' || i18n.language === 'en-GB'
            ? 'bg-primary-600 text-white'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
        }`}
        data-testid="language-en"
      >
        EN
      </button>
    </div>
  )
}
