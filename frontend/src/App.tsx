import { type ReactNode } from 'react'
import { ErrorBoundary } from '@shared/components'

/**
 * App Component
 *
 * Root application component wrapped with ErrorBoundary
 * Note: This component is available for reference but the app
 * uses RouterProvider directly in main.tsx
 */
interface AppProps {
  children: ReactNode
}

export const App: React.FC<AppProps> = ({ children }) => {
  return <ErrorBoundary>{children}</ErrorBoundary>
}

export default App
