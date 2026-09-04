import { useMemo } from 'react'

import type { SlotsToClasses } from '@opengovsg/oui-theme'
import {
  BiSolidCheckCircle,
  BiSolidErrorCircle,
  BiSolidInfoCircle,
} from 'react-icons/bi'

import type { InfoboxSlots, InfoboxVariantProps } from './infobox.styles'
import { infoboxStyles } from './infobox.styles'

interface InfoboxProps extends InfoboxVariantProps {
  /**
   * The content of the infobox.
   */
  children: React.ReactNode
  /**
   * Icon to show on the left of the infobox.
   * If not specified, a default icon will be used according to the infobox variant.
   * Provide `null` to hide the icon.
   */
  icon?: React.ReactNode | null
  className?: string
  classNames?: SlotsToClasses<InfoboxSlots>
}

export const Infobox = ({
  variant,
  size,
  icon: iconProp,
  className,
  classNames,
  children,
}: InfoboxProps) => {
  const styles = infoboxStyles({ size, variant })

  const icon = useMemo(() => {
    // `null` hides the icon; `undefined` falls through to the variant default.
    if (iconProp === null) {
      return null
    }
    const iconClassName = styles.icon({ className: classNames?.icon })
    if (iconProp !== undefined) {
      return <div className={iconClassName}>{iconProp}</div>
    }
    switch (variant) {
      case 'error': {
        return <BiSolidErrorCircle className={iconClassName} />
      }
      case 'success': {
        return <BiSolidCheckCircle className={iconClassName} />
      }
      case 'info':
      case 'warning':
      case undefined: {
        return <BiSolidInfoCircle className={iconClassName} />
      }
      default: {
        return <BiSolidInfoCircle className={iconClassName} />
      }
    }
  }, [classNames?.icon, iconProp, styles, variant])

  return (
    <div
      className={styles.base({
        className: className ?? classNames?.base,
      })}
    >
      {icon}
      {children}
    </div>
  )
}
