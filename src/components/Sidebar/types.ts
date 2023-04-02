import type { AccordionProps } from '@chakra-ui/react'
import { type ButtonProps } from '@opengovsg/design-system-react'

export type BaseSidebarItem = {
  label: string
  icon?: JSX.Element
}

export interface SidebarChildItem extends BaseSidebarItem {
  props?: ButtonProps
}

export interface SidebarNestableItem extends BaseSidebarItem {
  subItems: SidebarItemType[]
  props?: AccordionProps & {
    [key: string]: any
  }
}

export type SidebarItemType = SidebarNestableItem | SidebarChildItem
