'use client'

import type { VariantProps } from '@opengovsg/oui-theme'
import { buttonStyles } from '@opengovsg/oui-theme'
import type { LinkProps } from 'react-aria-components'
import { Link } from 'react-aria-components'

interface LinkButtonProps
  extends
    Omit<LinkProps, 'className' | 'children'>,
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
}: LinkButtonProps) => (
  <Link
    {...props}
    className={buttonStyles({
      className,
      color,
      isAttached,
      isIconOnly,
      radius,
      size,
      variant,
    })}
  >
    {startContent}
    {props.children}
    {endContent}
  </Link>
)
