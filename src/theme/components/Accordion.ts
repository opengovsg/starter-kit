import { accordionAnatomy as parts } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

import { theme as ogpDsTheme } from '@opengovsg/design-system-react'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys)

const variantSidebar = definePartsStyle({
  root: {
    w: '100%',
  },
  panel: {
    p: 0,
  },
  container: {
    border: 'none',
  },
  button: {
    gap: '1rem',
    justifyContent: 'space-between',
    outlineOffset: '-2px',
    color: `interaction.support.unselected-strong`,
    borderColor: 'base.divider.strong',
    p: '1rem',
    _expanded: {
      bg: `interaction.main-subtle.default`,
      color: `interaction.main.default`,
      borderColor: `interaction.main.default`,
      _hover: {
        bg: `interaction.main-subtle.hover`,
      },
    },
    _hover: {
      color: `interaction.main.hover`,
      bg: `interaction.main-subtle.hover`,
      borderColor: `interaction.main.default`,
    },
    _focusVisible: {
      ...ogpDsTheme.layerStyles.focusRing.default._focusVisible,
      outlineOffset: '-2px',
    },
  },
})

const variants = {
  sidebar: variantSidebar,
}

export const Accordion = defineMultiStyleConfig({
  variants,
})
