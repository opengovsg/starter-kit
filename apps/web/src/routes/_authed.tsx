import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { AuthedNavbar } from '~/app/(authed)/_components/authed-navbar'
import { EnvBanner } from '~/app/_components/env-banner'
import { VersionCheckWrapper } from '~/app/_components/version-check-wrapper'
import { LOGIN_ROUTE } from '~/constants'
import { getSession } from '~/server/session'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    // DO NOT SKIP AUTHENTICATION CHECKS IN YOUR PROCEDURES.
    // It is NOT secure. You can access route data by calling server functions directly.
    // Always put your auth call as close to the actual data call as possible.
    const session = await getSession()
    if (!session.userId) {
      throw redirect({ to: LOGIN_ROUTE })
    }
  },
  component: AuthedLayout,
})

function AuthedLayout() {
  return (
    <main className="flex min-h-dvh flex-col">
      <EnvBanner />
      <VersionCheckWrapper />
      <AuthedNavbar />
      <div className="container mx-auto flex flex-col gap-4 p-4">
        <Outlet />
      </div>
    </main>
  )
}
