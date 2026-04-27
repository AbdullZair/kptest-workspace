import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { I18nProvider } from './app/providers'

// Styles
import './index.css'

// App
import { router } from './app/routes'
import { store } from './app/store'

/**
 * Application entry point
 */
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Failed to find root element')
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <I18nProvider>
        <RouterProvider router={router} />
      </I18nProvider>
    </Provider>
  </StrictMode>
)
