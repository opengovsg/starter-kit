import {
  ButtonGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { trpc } from '~/utils/trpc'
import { actionStateAtom, resetActionAtom } from '../api/actionState'

export const DeleteFeedbackModal = (): JSX.Element | null => {
  const { state, postId } = useAtomValue(actionStateAtom)
  const resetState = useSetAtom(resetActionAtom)

  const utils = trpc.useContext()
  const deleteMutation = trpc.post.delete.useMutation({
    onSuccess: () => {
      utils.post.list.invalidate()
      resetState()
    },
  })

  const handleClose = useCallback(() => resetState(), [resetState])

  const handleDelete = useCallback(() => {
    if (!postId) return
    return deleteMutation.mutate({
      id: postId,
    })
  }, [deleteMutation, postId])

  return (
    <Modal isOpen={state === 'delete'} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete feedback?</ModalHeader>
        <ModalBody>This action cannot be undone</ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button colorScheme="neutral" variant="clear" onClick={handleClose}>
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
    </Modal>
  )
}
