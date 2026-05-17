import type { ReactNode } from 'react'

import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'

import { Toaster } from '@opengovsg/oui'
import { cn } from '@opengovsg/oui-theme'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { NuqsAdapter } from 'nuqs/adapters/react'

import '~/app/globals.css'
import { NotFoundCard } from '~/app/_components/errors/not-found-card'
import { RouterProgressBar } from '~/app/_components/router-progress-bar'
import { ClientProviders } from '~/app/provider'
import { env } from '~/env'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: env.VITE_APP_NAME },
      {
        name: 'description',
        content: 'Simple monorepo Starter Kit with for OGP projects',
      },
      { property: 'og:title', content: env.VITE_APP_NAME },
      {
        property: 'og:description',
        content: 'Simple monorepo Starter Kit with for OGP projects',
      },
      { property: 'og:url', content: 'https://start.open.gov.sg' },
      { property: 'og:site_name', content: env.VITE_APP_NAME },
    ],
  }),
  notFoundComponent: () => (
    <main className="flex min-h-dvh flex-col items-center justify-center">
      <NotFoundCard
        title="Page Not Found"
        message="The page you are looking for does not exist or has been deleted."
      />
    </main>
  ),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className={cn('text-base-content-default font-sans antialiased')}>
        <ClientProviders>
          <RouterProgressBar />
          <NuqsAdapter>{children}</NuqsAdapter>
          <ReactQueryDevtools initialIsOpen={false} />
          <Toaster />
        </ClientProviders>
        <Scripts />
      </body>
    </html>
  )
}
