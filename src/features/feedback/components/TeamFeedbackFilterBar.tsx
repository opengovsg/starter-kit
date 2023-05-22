import {
  Box,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Menu,
} from '@chakra-ui/react'
import { ChevronMenuButton } from '~/components/ChevronMenuButton'
import { useFilterFeedback } from '../api/useFilterFeedback'

interface FilterSelectProps {
  selection: {
    value: string
    label: string
    options: { label: string; value: string }[]
  }
  onChange: (value: string | string[]) => void
  isDisabled?: boolean
}
const FilterSelect = ({
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

export const TeamFeedbackFilterBar = (): JSX.Element => {
  const { filter, order, handleFilterChange, handleOrderChange } =
    useFilterFeedback()

  return (
    <Box
      px="2rem"
      py="1.125rem"
      borderBottomWidth="1px"
      borderColor="base.divider.medium"
    >
      <FilterSelect selection={filter} onChange={handleFilterChange} />
      <FilterSelect selection={order} onChange={handleOrderChange} />
    </Box>
  )
}
