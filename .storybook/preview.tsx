import '@fontsource/ibm-plex-mono'
import 'inter-ui/inter.css'

import type { Preview, Decorator } from '@storybook/react'
import { withThemeFromJSXProvider } from '@storybook/addon-styling'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { PropsWithChildren, useState } from 'react'
import { createTRPCReact } from '@trpc/react-query'
import { AppRouter } from '~/server/modules/_app'
import superjson from 'superjson'
import { ThemeProvider } from '@opengovsg/design-system-react'
import { theme } from '~/theme'

import { initialize, mswDecorator } from 'msw-storybook-addon'

// Initialize MSW
initialize({
  onUnhandledRequest: 'bypass',
})

const trpc = createTRPCReact<AppRouter>()

const StorybookTrpcProvider = ({ children }: PropsWithChildren) => {
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
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
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
  (Story) => (
    <StorybookTrpcProvider>
      <Story />
    </StorybookTrpcProvider>
  ),
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
