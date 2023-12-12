import { type FC, type PropsWithChildren } from 'react'
import { GridItem, type GridProps } from '@chakra-ui/react'

import { AppGrid } from '~/templates/AppGrid'

// Component that controls the various grid areas according to responsive breakpoints.
export const BaseGridLayout = (props: GridProps) => (
  <AppGrid
    px={{ base: '1.5rem', md: '1.75rem', lg: '2rem' }}
    templateRows={{ base: '1fr auto', md: 'auto 1fr auto', lg: '1fr auto' }}
    {...props}
  />
)

// Grid area styling for the login form.
export const LoginGridArea: FC<PropsWithChildren> = ({ children }) => (
  <GridItem
    gridColumn={{ base: '1 / 5', md: '2 / 12', lg: '8 / 12' }}
    py="2rem"
    display="flex"
    justifyContent="center"
    alignItems={{ lg: 'center' }}
  >
    {children}
  </GridItem>
)

// Grid area styling for the footer.
export const FooterGridArea: FC<PropsWithChildren> = ({ children }) => (
  <GridItem
    gridColumn={{ base: '1 / 5', md: '2 / 12', lg: '8 / 12' }}
    py="4rem"
    display="flex"
    justifyContent={{ base: 'center', lg: 'initial' }}
  >
    {children}
  </GridItem>
)

// Grid area styling for the left side of footer area that only displays on tablet and desktop breakpoints.
export const NonMobileFooterLeftGridArea = () => (
  <GridItem
    ml={{ md: '-1.75rem', lg: '-2rem' }}
    mr={{ md: '-1.75rem', lg: 0 }}
    display={{ base: 'none', md: 'flex' }}
    gridColumn={{ md: '1 / 13', lg: '1 / 7' }}
    background="base.canvas.brand-subtle"
  />
)

// Grid area styling for the left sidebar that only displays on tablet and desktop breakpoints.
export const NonMobileSidebarGridArea: FC<PropsWithChildren> = ({
  children,
}) => (
  <GridItem
    display={{ base: 'none', md: 'flex' }}
    gridColumn={{ md: '1 / 13', lg: '1 / 7' }}
    h={{ md: '9.5rem', lg: 'auto' }}
    py="1rem"
    flexDir="column"
    alignItems="center"
    justifyContent="center"
    bg="base.canvas.brand-subtle"
    ml={{ md: '-1.75rem', lg: '-2rem' }}
    mr={{ md: '-1.75rem', lg: 0 }}
  >
    {children}
  </GridItem>
)
