import { ModalProps, Modal, ModalContent, ModalBody } from '@chakra-ui/react'

export const DeletePostModal = (
  props: Pick<ModalProps, 'isOpen' | 'onClose'>
) => {
  return (
    <Modal {...props}>
      <ModalContent>
        <ModalBody>Delete confirm?</ModalBody>
      </ModalContent>
    </Modal>
  )
}
