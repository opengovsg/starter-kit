import { Grid, type GridProps } from '@chakra-ui/react'

/**
 * Component that controls the various grid areas according to the app's
 * responsive breakpoints.
 */
export const AppGrid = (props: GridProps) => (
  <Grid
    columnGap={{ base: '0.5rem', lg: '1rem' }}
    templateColumns={{ base: 'repeat(4, 1fr)', md: 'repeat(12, 1fr)' }}
    {...props}
  />
)
