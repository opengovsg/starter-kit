import { GovtBanner } from '@opengovsg/oui/govt-banner'

import type { DynamicLayoutProps } from '~/types/nextjs'
import { VersionCheckWrapper } from '../_components/version-check-wrapper'

export default function PublicLayout({ children }: DynamicLayoutProps) {
  return (
    <main className="flex min-h-dvh flex-col">
      <GovtBanner />
      <VersionCheckWrapper />
      {children}
    </main>
  )
}
