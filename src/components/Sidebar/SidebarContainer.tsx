import { type FC, type PropsWithChildren } from 'react'
import { Flex, type FlexProps, useMultiStyleConfig } from '@chakra-ui/react'

import { SidebarProvider } from './SidebarContext'
import { SidebarStylesProvider } from './SidebarStylesContext'

export interface SidebarContainerProps extends FlexProps {
  /**
   * If true, the sidebar will be collapsed and the label text will be hidden.
   * @note If value is not `undefined`, the label text will be clamped to a single line for smoother expansion animation.
   */
  collapsed?: boolean
}

export const SidebarContainer: FC<PropsWithChildren<SidebarContainerProps>> = ({
  children,
  collapsed,
  ...flexProps
}) => {
  const styles = useMultiStyleConfig('Sidebar', {})

  return (
    <Flex flex={1} flexDir="column" {...flexProps}>
      <SidebarProvider collapsed={collapsed}>
        <SidebarStylesProvider value={styles}>{children}</SidebarStylesProvider>
      </SidebarProvider>
    </Flex>
  )
}
