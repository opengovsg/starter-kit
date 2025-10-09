import type { DynamicLayoutProps } from '~/types/nextjs'
import { VersionCheckWrapper } from '../_components/version-check-wrapper'

export default function AuthedLayout({ children }: DynamicLayoutProps) {
  // DO NOT ADD ANY AUTHENTICATION LOGIC HERE
  // It is NOT secure. You can access a page data bypassing a layout call. It’s not trivial but it can be done.
  // Always put your auth call as close to the actual data call as possible, ideally right before access.

  // This layout is only for wrapping pages that require authentication with components that are common to all authenticated pages.
  // The main difference between this layout and the public layout is the absence of the GovtBanner component.

  return (
    <main className="flex min-h-dvh flex-col">
      <VersionCheckWrapper />
      {children}
    </main>
  )
}
