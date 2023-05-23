import { createContext, useContext, useMemo } from 'react'
import {
  type SystemStyleObject,
  useControllableState,
  useDisclosure,
} from '@chakra-ui/react'

export interface SidebarContextProps {
  collapsed?: boolean
  onToggleCollapse?: (collapsed: boolean) => void
  children?:
    | React.ReactNode
    | ((props: SidebarContextReturn) => React.ReactNode)
}

export interface SidebarContextReturn {
  collapsed: boolean
  onToggleCollapse: () => void
  labelStyles: SystemStyleObject
  containerStyles: SystemStyleObject
}

const SidebarContext = createContext<SidebarContextReturn | undefined>(
  undefined
)

export const SidebarProvider = ({
  children,
  ...props
}: SidebarContextProps) => {
  const value = useProvideSidebar(props)
  return (
    <SidebarContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </SidebarContext.Provider>
  )
}

export const useSidebarContext = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

export const useProvideSidebar = ({
  collapsed: collapsedProp,
  onToggleCollapse: onToggleCollapseProp,
}: SidebarContextProps): SidebarContextReturn => {
  const [_collapsed, _onSetCollapsed] = useControllableState({
    value: onToggleCollapseProp ? collapsedProp : undefined,
    onChange: onToggleCollapseProp,
    defaultValue: collapsedProp,
  })

  const { isOpen: expanded, onToggle: onToggleCollapse } = useDisclosure({
    id: 'sidebar',
    isOpen: !_collapsed,
    onOpen: () => _onSetCollapsed(false),
    onClose: () => _onSetCollapsed(true),
  })

  const labelStyles: SystemStyleObject = useMemo(() => {
    if (!expanded) {
      return {
        opacity: 0,
      }
    }
    return {
      opacity: 1,
    }
  }, [expanded])

  const containerStyles: SystemStyleObject = useMemo(() => {
    if (!expanded) {
      return {
        transition: 'width 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
        width: '3.5rem',
      }
    }
    return {
      width: '100%',
      transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
    }
  }, [expanded])

  return {
    labelStyles,
    containerStyles,
    collapsed: !expanded,
    onToggleCollapse,
  }
}
