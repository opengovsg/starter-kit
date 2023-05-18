import { Flex, Spacer } from '@chakra-ui/react'
import { useFilterFeedback } from '../../api/useFilterFeedback'
import { FilterSearchbar } from './FilterSearchbar'
import { FilterSelect } from './FilterSelect'

export const DashboardFilterBar = (): JSX.Element => {
  const { filter, order, handleFilterChange, handleOrderChange, isLoading } =
    useFilterFeedback()

  return (
    <Flex
      px="2rem"
      py="1.125rem"
      borderBottomWidth="1px"
      borderColor="base.divider.medium"
    >
      <FilterSelect
        selection={filter}
        isDisabled={isLoading}
        onChange={handleFilterChange}
      />
      <FilterSelect
        selection={order}
        isDisabled={isLoading}
        onChange={handleOrderChange}
      />
      <Spacer />
      <FilterSearchbar />
    </Flex>
  )
}
