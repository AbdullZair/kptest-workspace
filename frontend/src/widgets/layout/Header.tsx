import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { useAuth } from '@features/auth'
import { useTheme } from '@app/providers'
import type { UserRole } from '@shared/components'
import { HelpDialog } from '@widgets/help'

/**
 * Header props
 */
interface HeaderProps {
  onMenuClick: () => void
}

/**
 * Navigation item based on user role
 */
interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  roles?: UserRole[]
}

/**
 * Role-based navigation items
 */
const getNavigationByRole = (role?: UserRole): NavItem[] => {
  const allNavItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: 'Pacjenci',
      href: '/patients',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      roles: ['ADMIN', 'DOCTOR', 'COORDINATOR'],
    },
    {
      name: 'Wizyty',
      href: '/appointments',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      name: 'Profil',
      href: '/profile',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      name: 'Ustawienia',
      href: '/settings',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      roles: ['ADMIN', 'COORDINATOR'],
    },
  ]

  if (!role) return allNavItems

  return allNavItems.filter((item) => !item.roles || item.roles.includes(role))
}

/**
 * Header Component
 *
 * Top header with logo, user menu dropdown, and actions
 * - Logo and brand
 * - Theme toggle
 * - Notifications
 * - User menu dropdown with logout
 *
 * @param onMenuClick - Callback for mobile menu toggle
 */
export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { setTheme, resolvedTheme } = useTheme()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== '?' || e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      e.preventDefault()
      setIsHelpOpen((v) => !v)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const userRole = user?.role as UserRole | undefined
  const navigation = getNavigationByRole(userRole)

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const getInitials = () => {
    if (!user?.firstName || !user?.lastName) return 'U'
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
  }

  const getUserRoleLabel = () => {
    const roleLabels: Record<string, string> = {
      ADMIN: 'Administrator',
      DOCTOR: 'Lekarz',
      NURSE: 'Pielęgniarka',
      RECEPTIONIST: 'Recepcja',
      PATIENT: 'Pacjent',
      COORDINATOR: 'Koordynator',
    }
    return user?.role ? roleLabels[user.role] || user.role : ''
  }

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-neutral-200 bg-white">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left side: Menu button and logo */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            type="button"
            className="rounded-lg p-2 transition-colors hover:bg-neutral-100 lg:hidden"
            onClick={onMenuClick}
            aria-label="Open menu"
            data-testid="hamburger-menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 shadow-md">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <span className="hidden text-xl font-bold text-neutral-900 sm:inline-block">
              KPTEST
            </span>
          </Link>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 transition-colors hover:bg-neutral-100"
            aria-label="Toggle theme"
            title={resolvedTheme === 'dark' ? 'Tryb jasny' : 'Tryb ciemny'}
          >
            {resolvedTheme === 'dark' ? (
              <svg
                className="h-5 w-5 text-neutral-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-neutral-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {/* Contextual help (US-S-20) */}
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="rounded-lg p-2 transition-colors hover:bg-neutral-100"
            aria-label="Pomoc kontekstowa"
            title="Pomoc kontekstowa (?)"
            data-testid="help-button"
          >
            <svg
              className="h-5 w-5 text-neutral-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="relative rounded-lg p-2 transition-colors hover:bg-neutral-100"
            aria-label="Powiadomienia"
            title="Powiadomienia"
          >
            <svg
              className="h-5 w-5 text-neutral-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-error-500" />
          </button>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-neutral-100"
              aria-label="User menu"
              aria-expanded={isUserMenuOpen}
            >
              {/* User avatar */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 shadow-sm">
                <span className="text-xs font-semibold text-white">{getInitials()}</span>
              </div>

              {/* User info (hidden on mobile) */}
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-neutral-900">
                  {user?.firstName || 'Użytkownik'}
                </p>
                <p className="text-xs text-neutral-500">{getUserRoleLabel()}</p>
              </div>

              {/* Dropdown arrow */}
              <svg
                className={clsx(
                  'h-4 w-4 text-neutral-500 transition-transform',
                  isUserMenuOpen && 'rotate-180'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* User menu dropdown */}
            {isUserMenuOpen ? (
              <div className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-56 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg duration-100">
                {/* User info (mobile) */}
                <div className="border-b border-neutral-100 px-4 py-3 md:hidden">
                  <p className="text-sm font-medium text-neutral-900">
                    {user?.firstName || 'Użytkownik'}
                  </p>
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                </div>

                {/* Navigation links */}
                <div className="py-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* Divider */}
                <div className="my-1 border-t border-neutral-100" />

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-error-600 transition-colors hover:bg-error-50"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Wyloguj się
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <HelpDialog isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </header>
  )
}

export default Header
