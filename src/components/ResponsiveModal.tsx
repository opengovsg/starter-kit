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

  return <ChakraModal size={modalSize} {...props} />
}
