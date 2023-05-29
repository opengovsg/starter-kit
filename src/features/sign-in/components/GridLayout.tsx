import { type FC, type PropsWithChildren } from 'react'
import { Flex, GridItem, type GridProps } from '@chakra-ui/react'

import { AppGrid } from '~/templates/AppGrid'

// Component for the split blue/white background.
export const BackgroundBox: FC<PropsWithChildren> = ({ children }) => (
  <Flex
    flex={1}
    overflow={{ lg: 'auto' }}
    flexDir="column"
    h="inherit"
    minH="$100vh"
    bgGradient={{
      md: 'linear(to-b, base.canvas.brand-subtle 20.5rem, white 0)',
      // We use 41.6667% because at the lg size, the grid column of the login area
      // is 7/12, so the remaining space is 5/12 = 0.416666...
      lg: 'linear(to-r, base.canvas.brand-subtle calc(41.6667% - 4px), white 0)',
    }}
  >
    {children}
  </Flex>
)

// Component that controls the various grid areas according to responsive breakpoints.
export const BaseGridLayout = (props: GridProps) => (
  <AppGrid templateRows={{ md: 'auto 1fr auto', lg: '1fr auto' }} {...props} />
)

// Grid area styling for the login form.
export const LoginGridArea: FC<PropsWithChildren> = ({ children }) => (
  <GridItem
    gridColumn={{ base: '1 / 5', md: '2 / 12', lg: '7 / 12' }}
    py="4rem"
    display="flex"
    alignItems={{ base: 'initial', lg: 'center' }}
    justifyContent="center"
  >
    {children}
  </GridItem>
)

// Grid area styling for the footer.
export const FooterGridArea: FC<PropsWithChildren> = ({ children }) => (
  <GridItem
    gridColumn={{ base: '1 / 5', md: '2 / 12', lg: '7 / 12' }}
    py="4rem"
    display="flex"
  >
    {children}
  </GridItem>
)

// Grid area styling for the left sidebar that only displays on tablet and desktop breakpoints.
export const NonMobileSidebarGridArea: FC<PropsWithChildren> = ({
  children,
}) => (
  <GridItem
    display={{ base: 'none', md: 'flex' }}
    gridColumn={{ md: '1 / 13', lg: '1 / 6' }}
    h={{ md: '20.5rem', lg: 'auto' }}
    pt={{ base: '1.5rem', md: '2.5rem', lg: '3rem' }}
    pb={{ lg: '3rem' }}
    flexDir="column"
    alignItems="center"
    justifyContent="center"
  >
    {children}
  </GridItem>
)
