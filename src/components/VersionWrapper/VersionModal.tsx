import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useBreakpointValue,
} from '@chakra-ui/react'
import { ModalCloseButton } from '@opengovsg/design-system-react'
import { useCallback } from 'react'
import { BiRefresh } from 'react-icons/bi'

interface VersionModalProps {
  isOpen: boolean
  onClose: () => void
}

export const VersionModal = ({ isOpen, onClose }: VersionModalProps) => {
  const onRefresh = useCallback(() => {
    window.location.reload()
  }, [])

  const modalSize = useBreakpointValue({
    base: 'mobile',
    md: 'md',
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>Update Available</ModalHeader>
        <ModalBody>
          Please refresh the page to get the latest version.
        </ModalBody>
        <ModalFooter>
          <Button
            variant="clear"
            w="full"
            colorScheme="neutral"
            onClick={onRefresh}
            leftIcon={<BiRefresh />}
          >
            Refresh
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
