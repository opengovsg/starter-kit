import {
  type ModalProps,
  Modal as ChakraModal,
  useBreakpointValue,
} from '@chakra-ui/react'

export const ResponsiveModal = (props: ModalProps) => {
  const modalSize = useBreakpointValue({
    base: 'mobile',
    md: 'md',
  })

  const scrollBehavior: ModalProps['scrollBehavior'] = useBreakpointValue({
    base: 'outside',
    md: 'inside',
  })

  const isCentered = useBreakpointValue({
    base: false,
    md: true,
  })

  return (
    <ChakraModal
      scrollBehavior={scrollBehavior}
      isCentered={isCentered}
      size={modalSize}
      {...props}
    />
  )
}
