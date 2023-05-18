import { useDisclosure } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import { BiMessageRounded } from 'react-icons/bi'
import { RouterOutput } from '~/utils/trpc'
import { AddCommentModal } from '../AddCommentModal'

interface AddCommentActionProps {
  post: RouterOutput['post']['byUser']['posts'][number]
}

export const AddCommentAction = ({
  post,
}: AddCommentActionProps): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button
        onClick={onOpen}
        aria-label="Comment"
        leftIcon={<BiMessageRounded fontSize="1.25rem" />}
      >
        {post._count.replies}
      </Button>
      <AddCommentModal parentPost={post} isOpen={isOpen} onClose={onClose} />
    </>
  )
}
