'use client'

import type { VariantProps } from '@opengovsg/oui-theme'
import type { LinkProps } from 'react-aria-components'
import { buttonStyles } from '@opengovsg/oui-theme'
import { Link } from 'react-aria-components'

interface LinkButtonProps
  extends Omit<LinkProps, 'className' | 'children'>,
    VariantProps<typeof buttonStyles> {
  className?: string
  children: React.ReactNode
  startContent?: React.ReactNode
  endContent?: React.ReactNode
}

export const LinkButton = ({
  isAttached,
  isIconOnly,
  size,
  variant,
  color,
  className,
  startContent,
  endContent,
  radius,
  ...props
}: LinkButtonProps) => {
  return (
    <Link
      {...props}
      className={buttonStyles({
        isAttached,
        isIconOnly,
        size,
        variant,
        color,
        className,
        radius,
      })}
    >
      {startContent}
      {props.children}
      {endContent}
    </Link>
  )
}
