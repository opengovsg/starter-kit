import { useMemo } from 'react'

import { NestedSidebarItem } from './NestedSidebarItem'
import { SidebarCollapseButton } from './SidebarCollapseButton'
import { SidebarContainer } from './SidebarContainer'
import { SidebarItem } from './SidebarItem'
import { SidebarSection } from './SidebarSection'
import type { SidebarItemType, SidebarNestableItem } from './types'

export interface SidebarProps {
  items: SidebarItemType[]
  collapsed?: boolean
}

const isNestableItem = (item: SidebarItemType): item is SidebarNestableItem => {
  return 'subItems' in item
}

// Generate recursive sidebar items if nested
const generateSidebarItems = (
  items: SidebarItemType[],
  root?: boolean
): JSX.Element[] => {
  return items.map((item, index) => {
    if (isNestableItem(item)) {
      return (
        <NestedSidebarItem
          root={root}
          key={index}
          label={item.label}
          icon={item.icon}
          {...item.props}
        >
          {generateSidebarItems(item.subItems, false)}
        </NestedSidebarItem>
      )
    }
    const { props, ...rest } = item
    return <SidebarItem root={root} key={index} {...rest} {...props} />
  })
}

export const Sidebar = ({ items, collapsed }: SidebarProps): JSX.Element => {
  const sidebarItems = useMemo(() => generateSidebarItems(items, true), [items])
  return (
    <SidebarContainer collapsed={collapsed}>{sidebarItems}</SidebarContainer>
  )
}

Sidebar.Container = SidebarContainer
Sidebar.Container.displayName = 'Sidebar.Container'
Sidebar.Section = SidebarSection
Sidebar.Section.displayName = 'Sidebar.Section'
Sidebar.Item = SidebarItem
Sidebar.Item.displayName = 'Sidebar.Item'
Sidebar.NestedItem = NestedSidebarItem
Sidebar.NestedItem.displayName = 'Sidebar.NestedItem'
Sidebar.CollapseButton = SidebarCollapseButton
Sidebar.CollapseButton.displayName = 'Sidebar.CollapseButton'
