import { useDisclosure } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import { type MouseEventHandler } from 'react'
import { BiMessageRounded } from 'react-icons/bi'
import { type RouterOutput } from '~/utils/trpc'
import { AddCommentModal } from '../AddCommentModal'
import { useFeatures } from '~/components/AppProviders'

interface AddCommentActionProps {
  post: RouterOutput['post']['byUser']['posts'][number]
  onSuccess?: () => void
}

export const AddCommentAction = ({
  post,
  onSuccess,
}: AddCommentActionProps): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { storage } = useFeatures()

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
        px="0.25rem"
        leftIcon={<BiMessageRounded fontSize="1.25rem" />}
      >
        {post._count.replies}
      </Button>
      <AddCommentModal
        allowImageUpload={storage}
        parentPost={post}
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </>
  )
}
