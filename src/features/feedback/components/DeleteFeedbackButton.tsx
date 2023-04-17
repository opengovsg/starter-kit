import { IconButton } from '@opengovsg/design-system-react'
import { BiTrash } from 'react-icons/bi'
import { trpc } from '~/utils/trpc'

interface DeleteFeedbackButtonProps {
  feedbackId: string
}

export const DeleteFeedbackButton = ({
  feedbackId,
}: DeleteFeedbackButtonProps): JSX.Element => {
  const utils = trpc.useContext()

  const { mutate, isLoading } = trpc.post.delete.useMutation({
    onSuccess: () => utils.post.list.invalidate(),
  })

  return (
    <IconButton
      onClick={() => mutate({ id: feedbackId })}
      isLoading={isLoading}
      w={0}
      variant="clear"
      colorScheme="critical"
      aria-label="Delete feedback"
      icon={<BiTrash />}
    />
  )
}
