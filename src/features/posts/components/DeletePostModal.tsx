import {
  type ModalProps,
  Modal,
  ModalContent,
  ModalBody,
  ModalOverlay,
  ModalHeader,
  ModalFooter,
  ButtonGroup,
} from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import { type RouterOutput, trpc } from '~/utils/trpc'

interface DeletePostModalProps extends Pick<ModalProps, 'isOpen' | 'onClose'> {
  postId: RouterOutput['post']['byUser']['posts'][number]['id']
}

export const DeletePostModal = ({
  isOpen,
  onClose,
  postId,
}: DeletePostModalProps) => {
  const utils = trpc.useContext()
  const deletePostMutation = trpc.post.delete.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate()
      onClose()
    },
  })

  const handleDelete = () => {
    return deletePostMutation.mutate({ id: postId })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete post</ModalHeader>
        <ModalBody>
          This cannot be undone, and it will be removed from your profile and
          search results.
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button colorScheme="neutral" variant="clear" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="critical" onClick={handleDelete}>
              Delete post
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
