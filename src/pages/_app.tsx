import '@fontsource/ibm-plex-mono' // Import if using code textStyles.
import 'inter-ui/inter.css' // Strongly recommended.

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from '@opengovsg/design-system-react'
import type { AppProps, AppType } from 'next/app'
import { NextPageWithLayout } from '~/lib/types'
import { DefaultLayout } from '~/templates/layouts/DefaultLayout'
import { theme } from '~/theme'
import { trpc } from '~/utils/trpc'

type AppPropsWithAuthAndLayout = AppProps & {
  Component: NextPageWithLayout
}

const MyApp = (({ Component, pageProps }: AppPropsWithAuthAndLayout) => {
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>)

  return (
    <ThemeProvider theme={theme}>
      {getLayout(<Component {...pageProps} />)}
      {process.env.NODE_ENV !== 'production' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </ThemeProvider>
  )
}) as AppType

export default trpc.withTRPC(MyApp)
