import { useDisclosure } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import { MouseEventHandler } from 'react'
import { BiMessageRounded } from 'react-icons/bi'
import { RouterOutput } from '~/utils/trpc'
import { AddCommentModal } from '../AddCommentModal'

interface AddCommentActionProps {
  post: RouterOutput['post']['byUser']['posts'][number]
  onSuccess?: () => void
}

export const AddCommentAction = ({
  post,
  onSuccess,
}: AddCommentActionProps): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleOpenModal: MouseEventHandler = (e) => {
    e.stopPropagation()
    onOpen()
  }

  return (
    <>
      <Button
        data-value="post-action"
        onClick={handleOpenModal}
        aria-label="Comment"
        leftIcon={<BiMessageRounded fontSize="1.25rem" />}
      >
        {post._count.replies}
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
