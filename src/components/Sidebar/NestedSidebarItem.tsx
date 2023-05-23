import { type FC, type PropsWithChildren, useMemo } from 'react'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  type AccordionProps,
  Flex,
  Text,
  VStack,
} from '@chakra-ui/react'
import { merge } from 'lodash'

import { useSidebarContext } from './SidebarContext'
import { useSidebarStyles } from './SidebarStylesContext'
import type { BaseSidebarItem } from './types'

export interface NestedSidebarItemProps extends BaseSidebarItem {
  /**
   * Whether the item is the root item of the sidebar. Determines styling.
   */
  root?: boolean
  props?: AccordionProps
}

export const NestedSidebarItem: FC<
  PropsWithChildren<NestedSidebarItemProps>
> = ({ icon, label, props, root, children }) => {
  const styles = useSidebarStyles()

  const { labelStyles, collapsed } = useSidebarContext()

  const itemStyles = useMemo(() => {
    return merge({}, styles.parent, root ? {} : styles.child, styles.item)
  }, [root, styles.child, styles.item, styles.parent])

  return (
    <Accordion variant="sidebar" colorScheme="main" allowToggle {...props}>
      <AccordionItem>
        <AccordionButton sx={itemStyles}>
          <Flex>
            {icon && (
              <Flex flexShrink={0} mr="0.5rem">
                {icon}
              </Flex>
            )}
            <Text
              // Force single line usage for smooth text expansion if collapsed prop is provided
              noOfLines={collapsed !== undefined ? 1 : undefined}
              sx={labelStyles}
            >
              {label}
            </Text>
          </Flex>
          <Flex sx={labelStyles} ml="0.5rem">
            <AccordionIcon />
          </Flex>
        </AccordionButton>
        <AccordionPanel>
          <VStack __css={styles.container} align="flex-start">
            {children}
          </VStack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
