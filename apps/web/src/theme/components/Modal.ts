import { modalAnatomy as parts } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys)

const baseStyleDialog = defineStyle((props) => {
  const { scrollBehavior } = props
  return {
    // Overriding default design system's margins to be app-specific
    my: '4rem',
    maxH: scrollBehavior === 'inside' ? 'calc(100% - 8rem)' : undefined,
  }
})

const baseStyle = definePartsStyle((props) => ({
  dialog: baseStyleDialog(props),
}))

export const Modal = defineMultiStyleConfig({
  baseStyle,
})
