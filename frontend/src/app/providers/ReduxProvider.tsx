import { Provider } from 'react-redux'
import { type PropsWithChildren } from 'react'
import { store } from '@app/store'

interface ReduxProviderProps extends PropsWithChildren {
  // Reserved for future store configuration options
}

/**
 * Redux Provider Component
 * Wraps the application with Redux store context
 */
export const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>
}
