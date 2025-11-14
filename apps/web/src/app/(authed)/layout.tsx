import { redirect } from 'next/navigation'

import type { DynamicLayoutProps } from '~/types/nextjs'
import { getSession } from '~/server/session'
import { VersionCheckWrapper } from '../_components/version-check-wrapper'

export default async function AuthedLayout({ children }: DynamicLayoutProps) {
  // DO NOT SKIP AUTHENTICATION CHECKS IN YOUR PROCEDURES.
  // It is NOT secure. You can access a page data bypassing a layout call. It’s not trivial but it can be done.
  // Always put your auth call as close to the actual data call as possible, ideally right before access.

  const session = await getSession()
  if (!session.userId) {
    redirect('/sign-in')
  }

  return (
    <main className="flex min-h-dvh flex-col">
      <VersionCheckWrapper />
      {children}
    </main>
  )
}
