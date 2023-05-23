import {
  ButtonGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Stack,
} from '@chakra-ui/react'
import { Button, useToast } from '@opengovsg/design-system-react'
import { useZodForm } from '~/lib/form'
import { addReplySchema } from '~/schemas/thread'
import { RouterOutput, trpc } from '~/utils/trpc'
import { ComposePost } from '../ComposePost'
import { PostView } from '../Post/PostView'

interface AddCommentModalProps extends Pick<ModalProps, 'isOpen' | 'onClose'> {
  parentPost: RouterOutput['post']['byUser']['posts'][number]
  onSuccess?: () => void
}

export const AddCommentModal = ({
  isOpen,
  onClose: onCloseProp,
  parentPost,
  onSuccess,
}: AddCommentModalProps) => {
  const toast = useToast({
    status: 'success',
  })

  const utils = trpc.useContext()

  const formMethods = useZodForm({
    schema: addReplySchema.omit({ postId: true }),
  })
  const { handleSubmit, reset } = formMethods

  const replyThreadMutation = trpc.thread.reply.useMutation({
    onSuccess: async () => {
      toast({ description: 'Reply posted' })
      onSuccess?.()
      reset()
      onClose()
      await utils.post.byId.invalidate({ id: parentPost.id })
    },
  })

  const handleSubmitReply = handleSubmit((values) => {
    return replyThreadMutation.mutate({ ...values, postId: parentPost.id })
  })

  const onClose = () => {
    reset()
    onCloseProp?.()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Reply post</ModalHeader>
        <ModalBody>
          <Stack spacing="1.5rem">
            <PostView
              containerProps={{
                padding: 0,
              }}
              post={parentPost}
              hideActions
            />
            <ComposePost {...formMethods} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button
              colorScheme="neutral"
              variant="clear"
              onClick={onClose}
              isDisabled={replyThreadMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReply}
              isLoading={replyThreadMutation.isLoading}
            >
              Reply to post
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
