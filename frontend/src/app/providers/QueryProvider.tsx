import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type PropsWithChildren, useState } from 'react'

interface QueryProviderProps extends PropsWithChildren {
  // Reserved for future query client configuration options
}

/**
 * Query Client Provider Component
 * Wraps the application with React Query context
 * Note: RTK Query is the primary data fetching solution,
 * but React Query can be used for specific use cases
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
