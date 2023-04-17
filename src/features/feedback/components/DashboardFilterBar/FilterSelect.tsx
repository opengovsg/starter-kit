import {
  Menu,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
} from '@chakra-ui/react'
import { ChevronMenuButton } from '~/components/ChevronMenuButton'

interface FilterSelectProps {
  selection: {
    value: string
    label: string
    options: { label: string; value: string }[]
  }
  onChange: (value: string | string[]) => void
  isDisabled?: boolean
}
export const FilterSelect = ({
  selection,
  onChange,
  isDisabled,
}: FilterSelectProps) => {
  return (
    <Menu>
      {({ isOpen }) => (
        <>
          <ChevronMenuButton isDisabled={isDisabled} isOpen={isOpen}>
            {selection.label}
          </ChevronMenuButton>
          <MenuList>
            <MenuOptionGroup
              value={selection.value}
              type="radio"
              onChange={onChange}
            >
              {selection.options.map((option) => (
                <MenuItemOption key={option.value} value={option.value}>
                  {option.label}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </>
      )}
    </Menu>
  )
}
