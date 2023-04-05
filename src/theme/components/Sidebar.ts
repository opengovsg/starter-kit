import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { anatomy } from '@chakra-ui/theme-tools'
import { theme as ogpDsTheme } from '@opengovsg/design-system-react'
import { Accordion } from './Accordion'

const parts = anatomy('sidebar').parts(
  'container',
  'item',
  'parent',
  'child',
  'icon'
)

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys)

const sizes = {
  xs: definePartsStyle({
    icon: {
      fontSize: '0.875rem',
    },
  }),
  sm: definePartsStyle({
    icon: {
      fontSize: '1rem',
    },
  }),
  md: definePartsStyle({
    icon: {
      fontSize: '1.25rem',
    },
  }),
}

const variantLine = definePartsStyle({
  container: {
    // 1rem padding + (1.5rem icon/2) - (2px border/2) for true centering
    ml: 'calc(1.75rem - 1px)',
  },
  child: {
    borderRadius: 0,
    borderLeftWidth: '2px',
    borderColor: 'base.divider.strong',
    p: '1rem',
    _active: {
      borderColor: 'base.divider.brand',
    },
    _focusVisible: {
      ...ogpDsTheme.layerStyles.focusRing.default._focusVisible,
      outlineOffset: '-2px',
    },
  },
  parent: {
    ...Accordion.variants?.sidebar.button,
    gap: 0,
    borderLeftWidth: 0,
  },
  item: {
    width: '100%',
    outline: 'none',
    outlineOffset: '-2px',
    textAlign: 'start',
    display: 'inline-flex',
    color: 'interaction.support.unselected-strong',
    p: '1rem',
    _active: {
      color: 'interaction.main.default',
      bg: 'interaction.main-subtle.default',
    },
    _hover: {
      color: 'interaction.main.hover',
    },
  },
})

const variants = {
  line: variantLine,
}

export const Sidebar = defineMultiStyleConfig({
  sizes,
  variants,
  baseStyle: {
    container: {
      transitionProperty: 'common',
      transitionDuration: 'normal',
    },
    item: {
      transitionProperty: 'common',
      transitionDuration: 'normal',
    },
  },
  defaultProps: {
    colorScheme: 'main',
    variant: 'line',
    size: 'md',
  },
})
