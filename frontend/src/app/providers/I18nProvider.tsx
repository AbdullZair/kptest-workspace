import { I18nextProvider } from 'react-i18next'
import i18n from '../../shared/config/i18n'

/**
 * I18nProvider Component
 *
 * Provides i18next context to the entire application
 */
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
)
