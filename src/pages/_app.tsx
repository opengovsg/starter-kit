import '@fontsource/ibm-plex-mono' // Import if using code textStyles.
import 'inter-ui/inter.css' // Strongly recommended.

import { Skeleton } from '@chakra-ui/react'
import { ThemeProvider } from '@opengovsg/design-system-react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider } from 'jotai'
import type { AppProps, AppType } from 'next/app'
import ErrorBoundary from '~/components/ErrorBoundary'
import Suspense from '~/components/Suspense'
import { type NextPageWithLayout } from '~/lib/types'
import { DefaultLayout } from '~/templates/layouts/DefaultLayout'
import { theme } from '~/theme'
import { trpc } from '~/utils/trpc'
import { FeatureProvider } from '~/components/AppProviders'
import { LoginStateProvider } from '~/features/auth'

type AppPropsWithAuthAndLayout = AppProps & {
  Component: NextPageWithLayout
}

const MyApp = ((props: AppPropsWithAuthAndLayout) => {
  return (
    // Must wrap Jotai's provider in SSR context, see https://jotai.org/docs/guides/nextjs#provider.
    <Provider>
      <LoginStateProvider>
        <ThemeProvider theme={theme}>
          <FeatureProvider>
            <ErrorBoundary>
              <Suspense fallback={<Skeleton width="100vw" height="100vh" />}>
                <ChildWithLayout {...props} />
                {process.env.NODE_ENV !== 'production' && (
                  <ReactQueryDevtools initialIsOpen={false} />
                )}
              </Suspense>
            </ErrorBoundary>
          </FeatureProvider>
        </ThemeProvider>
      </LoginStateProvider>
    </Provider>
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
