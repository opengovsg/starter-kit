import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  type ModalProps,
} from '@chakra-ui/react'
import { Button, ModalCloseButton } from '@opengovsg/design-system-react'
import { ResponsiveButton } from '~/components/ResponsiveButton'
import { ResponsiveModal } from '~/components/ResponsiveModal'
import { ResponsiveModalButtonGroup } from '~/components/ResponsiveModalButtonGroup'
import { trpc, type RouterOutput } from '~/utils/trpc'

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
    <ResponsiveModal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>Delete post</ModalHeader>
        <ModalBody>
          This cannot be undone, and it will be removed from your profile and
          search results.
        </ModalBody>
        <ModalFooter>
          <ResponsiveModalButtonGroup>
            <Button
              display={{
                base: 'none',
                md: 'flex',
              }}
              colorScheme="neutral"
              variant="clear"
              size={{ base: 'lg', md: 'xs' }}
              onClick={onClose}
            >
              Cancel
            </Button>
            <ResponsiveButton
              colorScheme="critical"
              variant="solid"
              size={{ base: 'lg', md: 'xs' }}
              onClick={handleDelete}
            >
              Delete post
            </ResponsiveButton>
          </ResponsiveModalButtonGroup>
        </ModalFooter>
      </ModalContent>
    </ResponsiveModal>
  )
}
