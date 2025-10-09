import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, Inter } from 'next/font/google'

import { Toaster } from '@acme/ui/toast'

import { TRPCReactProvider } from '~/trpc/react'

import '~/app/globals.css'

import { cn } from '@opengovsg/oui-theme'

export const metadata: Metadata = {
  title: 'Starter Kit',
  description: 'Simple monorepo Starter Kit with for OGP projects',
  openGraph: {
    title: 'Starter Kit',
    description: 'Simple monorepo Starter Kit with for OGP projects',
    url: 'https://start.open.gov.sg',
    siteName: 'Starter Kit',
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
          'bg-background text-foreground min-h-screen font-sans antialiased',
          inter.variable,
          ibmPlexMono.variable,
        )}
      >
        <TRPCReactProvider>{props.children}</TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  )
}
