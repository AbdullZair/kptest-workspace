import { useState, Outlet } from 'react-router-dom'
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
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Content area via Outlet */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-neutral-200 bg-white py-4 px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-neutral-500">
            <p>&copy; 2026 KPTEST Portal Medyczny. Wszelkie prawa zastrzeżone.</p>
            <div className="flex items-center gap-4">
              <a href="/privacy" className="hover:text-neutral-700 transition-colors">
                Polityka prywatności
              </a>
              <a href="/terms" className="hover:text-neutral-700 transition-colors">
                Regulamin
              </a>
              <a href="/help" className="hover:text-neutral-700 transition-colors">
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
