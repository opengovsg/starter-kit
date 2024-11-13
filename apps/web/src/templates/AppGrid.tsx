import type { GridProps } from '@chakra-ui/react'
import { Grid } from '@chakra-ui/react'

import { APP_GRID_TEMPLATE_COLUMN } from '~/constants/layouts'

/**
 * Component that controls the various grid areas according to the app's
 * responsive breakpoints.
 */
export const AppGrid = (props: GridProps) => (
  <Grid
    columnGap={{ base: '0.5rem', lg: '1rem' }}
    templateColumns={APP_GRID_TEMPLATE_COLUMN}
    {...props}
  />
)
