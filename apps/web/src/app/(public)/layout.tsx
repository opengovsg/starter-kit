import { GovtBanner } from '@opengovsg/oui/govt-banner'

import { VersionCheckWrapper } from '../_components/version-check-wrapper'

import type { DynamicLayoutProps } from '~/types/nextjs'

const PublicLayout = ({ children }: DynamicLayoutProps) => (
  <main className="flex min-h-dvh flex-col">
    <GovtBanner />
    <VersionCheckWrapper />
    {children}
  </main>
)

export default PublicLayout
