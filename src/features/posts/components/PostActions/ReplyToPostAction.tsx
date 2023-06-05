// Almost the same as AddCommentAction, but rendering is different

import { useDisclosure } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import { type MouseEventHandler } from 'react'
import { type RouterOutput } from '~/utils/trpc'
import { AddCommentModal } from '../AddCommentModal'

interface ReplyToPostActionProps {
  post: RouterOutput['post']['byUser']['posts'][number]
  onSuccess?: () => void
}

export const ReplyToPostAction = ({
  post,
  onSuccess,
}: ReplyToPostActionProps): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleOpenModal: MouseEventHandler = (e) => {
    e.stopPropagation()
    onOpen()
  }

  return (
    <>
      <Button
        size="sm"
        isFullWidth
        my="1rem"
        onClick={handleOpenModal}
        aria-label="Reply to post"
      >
        Reply to post
      </Button>
      <AddCommentModal
        parentPost={post}
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </>
  )
}
