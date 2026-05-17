import { createFileRoute, Outlet } from '@tanstack/react-router'

import { GovtBanner } from '@opengovsg/oui/govt-banner'

import { VersionCheckWrapper } from '~/app/_components/version-check-wrapper'

export const Route = createFileRoute('/_public')({
  component: PublicLayout,
})

function PublicLayout() {
  return (
    <main className="flex min-h-dvh flex-col">
      <GovtBanner />
      <VersionCheckWrapper />
      <Outlet />
    </main>
  )
}
