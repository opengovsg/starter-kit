import { cn } from '@opengovsg/oui-theme'

import { EmptyResultsSvg } from './svgs/empty-results-svg'

export interface EmptyPlaceholderProps {
  svg?: React.ReactNode
  title?: string
  description?: string
  size?: 'sm' | 'lg'
  children?: React.ReactNode
  className?: string
}

export const EmptyPlaceholder = ({
  svg = <EmptyResultsSvg />,
  title,
  description,
  size = 'sm',
  children,
  className,
}: EmptyPlaceholderProps) => {
  return (
    <div
      className={cn(
        `flex w-full flex-col items-center justify-center gap-2 py-12`,
        className,
      )}
    >
      <p className={size === 'sm' ? 'prose-h5' : 'prose-h4'}>
        {title ?? 'No Records'}
      </p>
      {description && (
        <p className={size === 'sm' ? 'prose-body-2' : 'prose-body-1'}>
          {description}
        </p>
      )}
      {svg}
      {children}
    </div>
  )
}
