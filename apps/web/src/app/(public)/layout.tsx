import { GovtBanner } from '@opengovsg/oui/govt-banner'

import { VersionCheckWrapper } from '../_components/version-check-wrapper'

import type { DynamicLayoutProps } from '~/types/nextjs'

export default function PublicLayout({ children }: DynamicLayoutProps) {
  return (
    <main className="flex min-h-dvh flex-col">
      <GovtBanner />
      <VersionCheckWrapper />
      {children}
    </main>
  )
}
