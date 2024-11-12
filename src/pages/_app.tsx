import '@fontsource/ibm-plex-mono' // Import if using code textStyles.
import 'inter-ui/inter.css' // Strongly recommended if using OGP design system, as design uses this font.

import type { AppProps, AppType } from 'next/app'
import { Skeleton, Stack } from '@chakra-ui/react'
import { ThemeProvider } from '@opengovsg/design-system-react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ErrorBoundary } from 'react-error-boundary'

import { trpc } from '~/utils/trpc'
import { EnvProvider, FeatureProvider } from '~/components/AppProviders'
import { DefaultFallback } from '~/components/ErrorBoundary/DefaultFallback'
import Suspense from '~/components/Suspense'
import { VersionWrapper } from '~/components/VersionWrapper'
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { env } from '~/env.mjs'
import { LoginStateProvider } from '~/features/auth'
import { type NextPageWithLayout } from '~/lib/types'
import { DefaultLayout } from '~/templates/layouts/DefaultLayout'
import { theme } from '~/theme'

type AppPropsWithAuthAndLayout = AppProps & {
  Component: NextPageWithLayout
}

const MyApp = ((props: AppPropsWithAuthAndLayout) => {
  return (
    <EnvProvider env={env}>
      <LoginStateProvider>
        <ThemeProvider theme={theme}>
          <FeatureProvider>
            <ErrorBoundary FallbackComponent={DefaultFallback}>
              <Suspense fallback={<Skeleton width="100vw" height="100vh" />}>
                <Stack spacing={0} minH="$100vh">
                  <VersionWrapper />
                  <ChildWithLayout {...props} />
                  {process.env.NODE_ENV !== 'production' && (
                    <ReactQueryDevtools initialIsOpen={false} />
                  )}
                </Stack>
              </Suspense>
            </ErrorBoundary>
          </FeatureProvider>
        </ThemeProvider>
      </LoginStateProvider>
    </EnvProvider>
  )
}) as AppType

// This is needed so suspense will be triggered for anything within the LayoutComponents which uses useSuspenseQuery
const ChildWithLayout = ({
  Component,
  pageProps,
}: AppPropsWithAuthAndLayout) => {
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>)

  return <>{getLayout(<Component {...pageProps} />)}</>
}

export default trpc.withTRPC(MyApp)
