import { type FC, type PropsWithChildren } from 'react'
import { type StackProps, VStack } from '@chakra-ui/react'
import { merge } from 'lodash'

import { useSidebarContext } from './SidebarContext'

export interface SidebarSectionProps extends StackProps {
  /**
   * If true, the sidebar will be collapsed and the label text will be hidden.
   * @note If value is not `undefined`, the label text will be clamped to a single line for smoother expansion animation.
   */
  collapsed?: boolean
}

export const SidebarSection: FC<PropsWithChildren<SidebarSectionProps>> = ({
  children,
  sx,
  ...props
}) => {
  const { containerStyles } = useSidebarContext()

  return (
    <VStack
      align="flex-start"
      spacing={0}
      sx={merge({}, containerStyles, sx)}
      {...props}
    >
      {children}
    </VStack>
  )
}
