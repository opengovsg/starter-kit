import {
  Modal,
  ModalBody,
  ModalContent,
  ModalProps,
  useDisclosure,
} from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'

const NewPostModal = (props: Pick<ModalProps, 'isOpen' | 'onClose'>) => {
  return (
    <Modal {...props}>
      <ModalContent>
        <ModalBody>Hello</ModalBody>
      </ModalContent>
    </Modal>
  )
}

export const NewPostModalButton = (): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button size="xs" onClick={onOpen}>
        New post
      </Button>
      <NewPostModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
