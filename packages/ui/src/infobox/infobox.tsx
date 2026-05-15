import { useMemo } from 'react'

import type { SlotsToClasses } from '@opengovsg/oui-theme'
import {
  BiSolidCheckCircle,
  BiSolidErrorCircle,
  BiSolidInfoCircle,
} from 'react-icons/bi'

import { mapPropsVariants } from '../utils'
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

export const Infobox = (originalProps: InfoboxProps) => {
  const [props, variantProps] = mapPropsVariants(
    originalProps,
    infoboxStyles.variantKeys
  )

  const styles = infoboxStyles(variantProps)

  const icon = useMemo(() => {
    // `null` hides the icon; `undefined` falls through to the variant default.
    if (props.icon === null) {
      return null
    }
    const iconClassName = styles.icon({ className: props.classNames?.icon })
    if (props.icon !== undefined) {
      return <div className={iconClassName}>{props.icon}</div>
    }
    switch (variantProps.variant) {
      case 'error':
        return <BiSolidErrorCircle className={iconClassName} />
      case 'success':
        return <BiSolidCheckCircle className={iconClassName} />
      default:
        return <BiSolidInfoCircle className={iconClassName} />
    }
  }, [props.classNames?.icon, props.icon, styles, variantProps.variant])

  return (
    <div
      className={styles.base({
        className: props.className ?? props.classNames?.base,
      })}
    >
      {icon}
      {props.children}
    </div>
  )
}
