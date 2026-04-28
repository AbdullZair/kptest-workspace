import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header, Sidebar } from '../layout'

/**
 * MainLayout Component
 *
 * Main application layout with:
 * - Header with logo, user menu, and actions
 * - Sidebar with role-based navigation
 * - Content area for page content (via Outlet)
 * - Footer
 * - Responsive design (mobile hamburger menu)
 *
 * @example
 * ```tsx
 * // In routes.tsx:
 * {
 *   path: '/',
 *   element: (
 *     <ProtectedRoute>
 *       <MainLayout />
 *     </ProtectedRoute>
 *   ),
 *   children: [...]
 * }
 * ```
 */
export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Content area via Outlet */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-neutral-200 bg-white px-6 py-4">
          <div className="flex flex-col items-center justify-between gap-2 text-sm text-neutral-500 sm:flex-row">
            <p>&copy; 2026 KPTEST Portal Medyczny. Wszelkie prawa zastrzeżone.</p>
            <div className="flex items-center gap-4">
              <a href="/privacy" className="transition-colors hover:text-neutral-700">
                Polityka prywatności
              </a>
              <a href="/terms" className="transition-colors hover:text-neutral-700">
                Regulamin
              </a>
              <a href="/help" className="transition-colors hover:text-neutral-700">
                Pomoc
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default MainLayout
