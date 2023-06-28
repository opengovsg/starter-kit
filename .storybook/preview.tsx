import '@fontsource/ibm-plex-mono'
import 'inter-ui/inter.css'

import { withThemeFromJSXProvider } from '@storybook/addon-styling'
import type { Decorator, Preview } from '@storybook/react'

import { ThemeProvider } from '@opengovsg/design-system-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { useState } from 'react'
import superjson from 'superjson'
import { AppRouter } from '~/server/modules/_app'
import { theme } from '~/theme'

import { Skeleton } from '@chakra-ui/react'
import { initialize, mswDecorator } from 'msw-storybook-addon'
import ErrorBoundary from '~/components/ErrorBoundary'
import Suspense from '~/components/Suspense'

// Initialize MSW
initialize({
  onUnhandledRequest: 'bypass',
})

const trpc = createTRPCReact<AppRouter>()

const SetupDecorator: Decorator = (page) => {
  const [queryClient] = useState(
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: Infinity,
          retry: false,
          refetchOnWindowFocus: false,
        },
      },
    })
  )
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: '' })],
      transformer: superjson,
    })
  )
  return (
    <ErrorBoundary>
      <Suspense fallback={<Skeleton width="100vw" height="100vh" />}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            {page()}
          </QueryClientProvider>
        </trpc.Provider>
      </Suspense>
    </ErrorBoundary>
  )
}

const decorators: Decorator[] = [
  mswDecorator,
  withThemeFromJSXProvider({
    themes: {
      default: theme,
    },
    Provider: ThemeProvider,
  }),
  SetupDecorator,
]

const preview: Preview = {
  decorators,
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
}

export default preview
