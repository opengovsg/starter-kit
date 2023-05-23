import { type FC, useMemo } from 'react'
import {
  Button,
  Icon,
  type SystemStyleObject,
  Text,
  usePrefersReducedMotion,
} from '@chakra-ui/react'

import { useSidebarContext } from './SidebarContext'
import { SidebarSection } from './SidebarSection'
import { BiArrowToLeft } from 'react-icons/bi'

export const SidebarCollapseButton: FC = () => {
  const { collapsed, onToggleCollapse } = useSidebarContext()

  const reduceMotion = usePrefersReducedMotion()

  const iconStyles: SystemStyleObject = useMemo(
    () => ({
      mr: collapsed ? '-0.5rem' : undefined,
      transform: collapsed ? 'rotate(-180deg)' : undefined,
      transition: reduceMotion ? undefined : 'transform 0.2s',
      transformOrigin: 'center',
    }),
    [collapsed, reduceMotion]
  )

  return (
    <SidebarSection collapsed={collapsed}>
      <Button
        variant="clear"
        colorScheme="sub"
        leftIcon={<Icon as={BiArrowToLeft} fontSize="1.5rem" sx={iconStyles} />}
        onClick={onToggleCollapse}
        maxW="fit-content"
        aria-label={`${collapsed ? 'Expand' : 'Collapse'} sidebar`}
      >
        <Text display={collapsed ? 'none' : undefined}>
          {collapsed ? 'Expand' : 'Collapse'}
        </Text>
      </Button>
    </SidebarSection>
  )
}
