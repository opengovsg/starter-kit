import { MenuButton, type MenuButtonProps } from '@chakra-ui/react'
import {
  Button,
  type ButtonProps,
  BxChevronDown,
  BxChevronUp,
} from '@opengovsg/design-system-react'
import { useMemo } from 'react'

export interface ChevronMenuButtonProps extends MenuButtonProps, ButtonProps {
  isOpen?: boolean
  showChevron?: boolean
}

export const ChevronMenuButton = ({
  showChevron = true,
  isOpen,
  ...props
}: ChevronMenuButtonProps): JSX.Element => {
  const rightIcon = useMemo(() => {
    if (!showChevron) {
      return undefined
    }

    return isOpen ? (
      <BxChevronUp fontSize="1.25rem" />
    ) : (
      <BxChevronDown fontSize="1.25rem" />
    )
  }, [isOpen, showChevron])

  return (
    <MenuButton
      as={Button}
      variant="clear"
      colorScheme="sub"
      rightIcon={rightIcon}
      {...props}
    />
  )
}
