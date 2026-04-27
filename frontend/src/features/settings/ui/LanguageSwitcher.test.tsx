import { render, screen, fireEvent } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../../shared/config/i18n'
import { LanguageSwitcher } from './LanguageSwitcher'

/**
 * LanguageSwitcher Tests
 */
describe('LanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear()
    i18n.changeLanguage('pl')
  })

  it('should render both PL and EN buttons', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    )

    expect(screen.getByText('PL')).toBeInTheDocument()
    expect(screen.getByText('EN')).toBeInTheDocument()
  })

  it('should highlight PL button when Polish is selected', () => {
    i18n.changeLanguage('pl')

    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    )

    const plButton = screen.getByText('PL')
    const enButton = screen.getByText('EN')

    expect(plButton).toHaveClass('bg-primary-600')
    expect(enButton).not.toHaveClass('bg-primary-600')
  })

  it('should highlight EN button when English is selected', () => {
    i18n.changeLanguage('en')

    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    )

    const plButton = screen.getByText('PL')
    const enButton = screen.getByText('EN')

    expect(plButton).not.toHaveClass('bg-primary-600')
    expect(enButton).toHaveClass('bg-primary-600')
  })

  it('should change language to Polish when PL button is clicked', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    )

    const plButton = screen.getByText('PL')
    fireEvent.click(plButton)

    expect(i18n.language).toBe('pl')
  })

  it('should change language to English when EN button is clicked', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    )

    const enButton = screen.getByText('EN')
    fireEvent.click(enButton)

    expect(i18n.language).toBe('en')
  })

  it('should persist language selection in localStorage', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    )

    const enButton = screen.getByText('EN')
    fireEvent.click(enButton)

    expect(localStorage.getItem('i18nextLng')).toBe('en')

    const plButton = screen.getByText('PL')
    fireEvent.click(plButton)

    expect(localStorage.getItem('i18nextLng')).toBe('pl')
  })

  it('should toggle between languages correctly', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    )

    const plButton = screen.getByText('PL')
    const enButton = screen.getByText('EN')

    // Start with PL
    expect(plButton).toHaveClass('bg-primary-600')

    // Click EN
    fireEvent.click(enButton)
    expect(enButton).toHaveClass('bg-primary-600')
    expect(plButton).not.toHaveClass('bg-primary-600')

    // Click PL again
    fireEvent.click(plButton)
    expect(plButton).toHaveClass('bg-primary-600')
    expect(enButton).not.toHaveClass('bg-primary-600')
  })
})
