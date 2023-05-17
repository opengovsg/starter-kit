import type { ComponentProps } from 'react'
import { chakra } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useNavigationalTabListStyles } from './NavigationalTabList'

interface NavigationTabProps extends ComponentProps<typeof NextLink> {
  isActive?: boolean
  isDisabled?: boolean
}

/** Must be nested inside NavigationTabList component, uses styles provided by that component. */
export const NavigationTab = ({
  isActive,
  isDisabled,
  children,
  ...props
}: NavigationTabProps) => {
  const styles = useNavigationalTabListStyles()

  if (isDisabled) {
    return (
      <chakra.a
        __css={styles.tab}
        aria-disabled
        display="inline-flex"
        alignItems="center"
      >
        {children}
      </chakra.a>
    )
  }

  return (
    <chakra.link
      aria-selected={isActive}
      __css={styles.tab}
      {...props}
      as={NextLink}
    >
      {children}
    </chakra.link>
  )
}
