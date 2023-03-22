import {
  Box,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Menu,
} from '@chakra-ui/react';
import { ChevronMenuButton } from '~/components/ChevronMenuButton';
import { useFilterFeedback } from '../api/useFilterFeedback';

export const TeamFeedbackFilterBar = (): JSX.Element => {
  const { filter, order, handleFilterChange, handleOrderChange, isLoading } =
    useFilterFeedback();

  return (
    <Box px="2rem" py="1.125rem" borderBottomWidth="1px">
      <Menu>
        {({ isOpen }) => (
          <>
            <ChevronMenuButton
              isDisabled={isLoading}
              isOpen={isOpen}
              minW="7.5rem"
            >
              {order.label}
            </ChevronMenuButton>
            <MenuList>
              <MenuOptionGroup
                value={order.value}
                type="radio"
                onChange={handleOrderChange}
              >
                {order.options.map((option) => (
                  <MenuItemOption key={option.value} value={option.value}>
                    {option.label}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </>
        )}
      </Menu>
      <Menu>
        {({ isOpen }) => (
          <>
            <ChevronMenuButton isDisabled={isLoading} isOpen={isOpen}>
              {filter.label}
            </ChevronMenuButton>
            <MenuList>
              <MenuOptionGroup
                value={filter.value}
                type="radio"
                onChange={handleFilterChange}
              >
                {filter.options.map((option) => (
                  <MenuItemOption key={option.value} value={option.value}>
                    {option.label}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </>
        )}
      </Menu>
    </Box>
  );
};
