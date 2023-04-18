import {
  Button,
  ButtonGroup,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@chakra-ui/react'
import { ModalCloseButton } from '@opengovsg/design-system-react'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { trpc } from '~/utils/trpc'
import { actionStateAtom } from '../../api/actionState'

interface FeedbackContentProps {
  onClose: () => void
}

export const DeleteFeedbackContent = ({ onClose }: FeedbackContentProps) => {
  const { post } = useAtomValue(actionStateAtom)
  const utils = trpc.useContext()
  const deleteMutation = trpc.post.delete.useMutation({
    onSuccess: () => {
      utils.post.list.invalidate()
      onClose()
    },
  })

  const handleDelete = useCallback(() => {
    if (!post) return
    return deleteMutation.mutate({
      id: post.id,
    })
  }, [deleteMutation, post])

  return (
    <ModalContent>
      <ModalCloseButton />
      <ModalHeader>Delete feedback?</ModalHeader>
      <ModalBody>This action cannot be undone</ModalBody>
      <ModalFooter>
        <ButtonGroup>
          <Button colorScheme="neutral" variant="clear" onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="critical"
            variant="solid"
            onClick={handleDelete}
            isLoading={deleteMutation.isLoading}
          >
            Delete feedback
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </ModalContent>
  )
}
