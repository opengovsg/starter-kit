import {
  Modal,
  ModalBody,
  ModalContent,
  ModalProps,
  useDisclosure,
} from '@chakra-ui/react'
import { IconButton } from '@opengovsg/design-system-react'
import { BiTrash } from 'react-icons/bi'

const DeleteTweetModal = (props: Pick<ModalProps, 'isOpen' | 'onClose'>) => {
  return (
    <Modal {...props}>
      <ModalContent>
        <ModalBody>Delete confirm?</ModalBody>
      </ModalContent>
    </Modal>
  )
}

export const DeleteTweet = (): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <IconButton
        colorScheme="critical"
        onClick={onOpen}
        aria-label="Delete tweet"
        icon={<BiTrash fontSize="1.25rem" />}
      />
      <DeleteTweetModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
