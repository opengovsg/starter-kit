import type { Metadata } from 'next'

import { Toaster } from '@opengovsg/oui'
import { cn } from '@opengovsg/oui-theme'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import '~/app/globals.css'
import NextTopLoader from 'nextjs-toploader'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { ClientProviders } from './provider'

import { env } from '~/env'
import { ibmPlexMono, inter } from '~/lib/fonts'

export const metadata: Metadata = {
  description: 'Simple monorepo Starter Kit with for OGP projects',
  openGraph: {
    description: 'Simple monorepo Starter Kit with for OGP projects',
    siteName: env.NEXT_PUBLIC_APP_NAME,
    title: env.NEXT_PUBLIC_APP_NAME,
    url: 'https://start.open.gov.sg',
  },
  title: env.NEXT_PUBLIC_APP_NAME,
}

const RootLayout = (props: { children: React.ReactNode }) => (
  <html lang="en" suppressHydrationWarning>
    <body
      className={cn(
        'text-base-content-default font-sans antialiased',
        inter.variable,
        ibmPlexMono.variable
      )}
    >
      <NextTopLoader color="var(--color-interaction-main-default)" />
      <ClientProviders>
        <NuqsAdapter>{props.children}</NuqsAdapter>
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster />
      </ClientProviders>
    </body>
  </html>
)

export default RootLayout
