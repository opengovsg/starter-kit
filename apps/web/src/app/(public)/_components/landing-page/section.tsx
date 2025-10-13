import type { SlotsToClasses } from '@opengovsg/oui-theme'
import type { PropsWithChildren } from 'react'
import { cn } from '@opengovsg/oui-theme'

export const LandingSection = ({
  children,
  className,
  classNames,
}: PropsWithChildren<{
  className?: string
  classNames?: SlotsToClasses<'section' | 'inner'>
}>) => {
  return (
    <section className={className ?? classNames?.section}>
      <div
        className={cn(
          'container mx-auto flex flex-col gap-4 px-4 py-14 md:py-22',
          classNames?.inner,
        )}
      >
        {children}
      </div>
    </section>
  )
}

export const SectionHeader = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => {
  return (
    <h2
      className={cn(
        'md:prose-responsive-heading-heavy-480 prose-responsive-heading-heavy text-base-content-strong',
        className,
      )}
    >
      {children}
    </h2>
  )
}

export const SectionBody = ({ children }: PropsWithChildren) => {
  return <p className="prose-body-1 text-base-content-default">{children}</p>
}
