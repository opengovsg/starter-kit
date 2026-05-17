import type { PropsWithChildren } from 'react'

import { useNavigate } from '@tanstack/react-router'

import { RouterProvider } from 'react-aria-components'

import { TRPCReactProvider } from '~/trpc/react'

declare module 'react-aria-components' {
  interface RouterConfig {
    routerOptions: never
  }
}

export function ClientProviders({ children }: PropsWithChildren) {
  const navigate = useNavigate()

  return (
    <RouterProvider navigate={(href) => void navigate({ to: href })}>
      <TRPCReactProvider>{children}</TRPCReactProvider>
    </RouterProvider>
  )
}
