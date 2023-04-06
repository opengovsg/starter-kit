import { useMemo } from 'react'
import { forwardRef, Text } from '@chakra-ui/react'
import { dataAttr } from '@chakra-ui/utils'
import { cloneDeep, mergeWith } from 'lodash'

import { useSidebarContext } from './SidebarContext'
import { useSidebarStyles } from './SidebarStylesContext'
import type { BaseSidebarItem } from './types'
import { Button, type ButtonProps } from '@opengovsg/design-system-react'

export interface SidebarItemProps extends BaseSidebarItem, ButtonProps {
  isActive?: boolean
  root?: boolean
}

export const SidebarItem = forwardRef<SidebarItemProps, 'button'>(
  ({ isActive, label, icon, as, root, ...props }, ref): JSX.Element => {
    const styles = useSidebarStyles()
    const { labelStyles, collapsed } = useSidebarContext()

    const itemStyles = useMemo(() => {
      return mergeWith(
        cloneDeep(styles.item),
        cloneDeep(root ? styles.parent : styles.child)
      )
    }, [root, styles.child, styles.item, styles.parent])

    return (
      <Button
        ref={ref}
        leftIcon={icon}
        __css={itemStyles}
        justifyContent="initial"
        data-active={dataAttr(isActive)}
        as={as}
        {...props}
      >
        <Text
          // Force single line usage for smooth text expansion if collapsed prop is provided
          noOfLines={collapsed !== undefined ? 1 : undefined}
          sx={labelStyles}
        >
          {label}
        </Text>
      </Button>
    )
  }
)
