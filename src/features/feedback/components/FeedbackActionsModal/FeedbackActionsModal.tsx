import { Modal, ModalOverlay } from '@chakra-ui/react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { actionStateAtom, resetActionAtom } from '../../api/actionState'
import { DeleteFeedbackContent } from './DeleteFeedbackContent'
import { EditFeedbackContent } from './EditFeedbackContent'

export const FeedbackActionsModal = (): JSX.Element | null => {
  const { post, state } = useAtomValue(actionStateAtom)
  const resetState = useSetAtom(resetActionAtom)

  const handleClose = useCallback(() => resetState(), [resetState])

  return (
    <Modal isOpen={post !== null} onClose={handleClose}>
      <ModalOverlay />
      {state === 'delete' && <DeleteFeedbackContent onClose={handleClose} />}
      {state === 'edit' && <EditFeedbackContent onClose={handleClose} />}
    </Modal>
  )
}
