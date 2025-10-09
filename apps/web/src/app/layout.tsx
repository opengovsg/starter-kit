import type { Metadata } from 'next'
import { IBM_Plex_Mono, Inter } from 'next/font/google'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import NextTopLoader from 'nextjs-toploader'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { Toaster } from '@acme/ui/toast'

import '~/app/globals.css'

import { cn } from '@opengovsg/oui-theme'

import { env } from '~/env'
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

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  weight: ['400', '700'],
})

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
