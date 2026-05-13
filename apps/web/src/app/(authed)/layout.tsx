import { redirect } from 'next/navigation'

import { EnvBanner } from '../_components/env-banner'
import { VersionCheckWrapper } from '../_components/version-check-wrapper'
import { AuthedNavbar } from './_components/authed-navbar'

import { LOGIN_ROUTE } from '~/constants'
import { getSession } from '~/server/session'
import { HydrateClient, prefetch, trpc } from '~/trpc/server'
import type { DynamicLayoutProps } from '~/types/nextjs'

export default async function AuthedLayout({ children }: DynamicLayoutProps) {
  // DO NOT SKIP AUTHENTICATION CHECKS IN YOUR PROCEDURES.
  // It is NOT secure. You can access a page data bypassing a layout call. It’s not trivial but it can be done.
  // Always put your auth call as close to the actual data call as possible, ideally right before access.

  const session = await getSession()
  if (!session.userId) {
    redirect(LOGIN_ROUTE)
  }
  await prefetch(trpc.me.get.queryOptions())

  return (
    <HydrateClient>
      <main className="flex min-h-dvh flex-col">
        <EnvBanner />
        <VersionCheckWrapper />
        <AuthedNavbar />
        <div className="container mx-auto flex flex-col gap-4 p-4">
          {children}
        </div>
      </main>
    </HydrateClient>
  )
}
