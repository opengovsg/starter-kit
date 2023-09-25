import '@fontsource/ibm-plex-mono'
import 'inter-ui/inter.css'

import { withThemeFromJSXProvider } from '@storybook/addon-themes'
import type { Args, Decorator, Preview } from '@storybook/react'
import mockdate from 'mockdate'

import { ThemeProvider } from '@opengovsg/design-system-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { useCallback, useMemo, useState } from 'react'
import superjson from 'superjson'
import { AppRouter } from '~/server/modules/_app'
import { theme } from '~/theme'

import { Box, Skeleton } from '@chakra-ui/react'
import { initialize, mswDecorator } from 'msw-storybook-addon'
import ErrorBoundary from '~/components/ErrorBoundary'
import Suspense from '~/components/Suspense'
import { format } from 'date-fns'
import { FeatureContext } from '~/components/AppProviders'
import { z } from 'zod'
import { LoginStateContext } from '~/features/auth'

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

export const mockFeatureFlagsDecorator: Decorator<Args> = (
  storyFn,
  { parameters }
) => {
  const featureSchema = z
    .object({
      storage: z.boolean().default(false),
      sgid: z.boolean().default(false),
    })
    .default({})
  const features = useMemo(() => {
    return featureSchema.parse(parameters.features)
  }, [])

  return (
    <FeatureContext.Provider value={features}>
      {storyFn()}
    </FeatureContext.Provider>
  )
}

const LoginStateDecorator: Decorator<Args> = (storyFn, { parameters }) => {
  const [hasLoginStateFlag, setLoginStateFlag] = useState(
    Boolean(parameters.loginState)
  )

  const setHasLoginStateFlag = useCallback(() => {
    setLoginStateFlag(true)
  }, [setLoginStateFlag])

  const removeLoginStateFlag = useCallback(() => {
    setLoginStateFlag(false)
  }, [setLoginStateFlag])

  return (
    <LoginStateContext.Provider
      value={{
        hasLoginStateFlag,
        removeLoginStateFlag,
        setHasLoginStateFlag,
      }}
    >
      {storyFn()}
    </LoginStateContext.Provider>
  )
}

export const mockDateDecorator: Decorator<Args> = (storyFn, { parameters }) => {
  mockdate.reset()

  if (!parameters.mockdate) {
    return storyFn()
  }

  mockdate.set(parameters.mockdate)

  const mockedDate = format(parameters.mockdate, 'dd-mm-yyyy HH:mma')

  return (
    <Box>
      <Box
        pos="fixed"
        top={0}
        right={0}
        bg="white"
        p="0.25rem"
        fontSize="0.75rem"
        lineHeight={1}
        zIndex="docked"
      >
        Mocking date: {mockedDate}
      </Box>
      {storyFn()}
    </Box>
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
  mockDateDecorator,
  mockFeatureFlagsDecorator,
  LoginStateDecorator,
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
