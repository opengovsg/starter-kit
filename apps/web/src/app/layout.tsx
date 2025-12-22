import type { Metadata } from 'next'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import NextTopLoader from 'nextjs-toploader'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import '~/app/globals.css'

import { Toaster } from '@opengovsg/oui'
import { cn } from '@opengovsg/oui-theme'

import { env } from '~/env'
import { ibmPlexMono, inter } from '~/lib/fonts'
import { ClientProviders } from './provider'

export const metadata: Metadata = {
  title: env.NEXT_PUBLIC_APP_NAME,
  description: 'Simple monorepo Starter Kit with for OGP projects',
  openGraph: {
    title: env.NEXT_PUBLIC_APP_NAME,
    description: 'Simple monorepo Starter Kit with for OGP projects',
    url: 'https://start.open.gov.sg',
    siteName: env.NEXT_PUBLIC_APP_NAME,
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'text-base-content-default font-sans antialiased',
          inter.variable,
          ibmPlexMono.variable,
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
}
