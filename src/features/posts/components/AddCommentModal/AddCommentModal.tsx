import {
  ButtonGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from '@chakra-ui/react'
import { Button, useToast } from '@opengovsg/design-system-react'
import { useZodForm } from '~/lib/form'
import { addReplySchema } from '~/schemas/thread'
import { RouterOutput, trpc } from '~/utils/trpc'
import { Post } from '../Post'
import { ComposeComment } from './ComposeComment'

interface AddCommentModalProps extends Pick<ModalProps, 'isOpen' | 'onClose'> {
  parentPost: RouterOutput['post']['byUser']['posts'][number]
}

export const AddCommentModal = ({
  isOpen,
  onClose,
  parentPost,
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
      reset()
      onClose()
      if (parentPost.author.username) {
        utils.post.byUser.setData(
          { username: parentPost.author.username },
          (oldData) => {
            if (oldData) {
              // Update reply count of this specific post
              const postIndex = oldData.posts.findIndex(
                (post) => post.id === parentPost.id
              )
              if (postIndex >= 0) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                oldData.posts[postIndex]!._count.replies += 1
              }
              return oldData
            }
          }
        )
      }
      await utils.post.byId.invalidate({ id: parentPost.id })
    },
  })

  const handleSubmitReply = handleSubmit((values) => {
    return replyThreadMutation.mutate({ ...values, postId: parentPost.id })
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Reply post</ModalHeader>
        <ModalBody>
          <Post post={parentPost} hideActions />
          <ComposeComment {...formMethods} />
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
