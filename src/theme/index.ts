import { extendTheme } from '@chakra-ui/react'
import { theme as ogpDsTheme } from '@opengovsg/design-system-react'
import { shadows } from './foundations/shadows'
import { layerStyles } from './layerStyles'
import { components } from './components'

export const theme = extendTheme(ogpDsTheme, {
  shadows,
  components: {
    ...ogpDsTheme.components,
    ...components,
  },
  layerStyles,
})
