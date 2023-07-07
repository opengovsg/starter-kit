import {
  ButtonGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  type ModalProps,
  Stack,
} from '@chakra-ui/react'
import { Button, useToast } from '@opengovsg/design-system-react'
import { useZodForm } from '~/lib/form'
import { type RouterOutput, trpc } from '~/utils/trpc'
import { useUploadImagesMutation } from '../../api'
import { clientAddReplySchema } from '../../schemas/clientAddPostSchema'
import { ComposePost } from '../ComposePost'
import { PostView } from '../Post/PostView'

interface AddCommentModalProps extends Pick<ModalProps, 'isOpen' | 'onClose'> {
  parentPost: RouterOutput['post']['byUser']['posts'][number]
  onSuccess?: () => void
  allowImageUpload?: boolean
}

export const AddCommentModal = ({
  isOpen,
  onClose: onCloseProp,
  parentPost,
  allowImageUpload,
  onSuccess,
}: AddCommentModalProps) => {
  const toast = useToast({
    status: 'success',
  })

  const utils = trpc.useContext()

  const uploadImagesMutation = useUploadImagesMutation()

  const formMethods = useZodForm({
    schema: clientAddReplySchema,
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

  const handleSubmitReply = handleSubmit(async ({ images, ...rest }) => {
    return uploadImagesMutation.mutate(images, {
      onSuccess: (uploadedImageKeys) => {
        return replyThreadMutation.mutate({
          ...rest,
          imageKeys: uploadedImageKeys,
          postId: parentPost.id,
        })
      },
    })
  })

  const areMutationsLoading =
    replyThreadMutation.isLoading || uploadImagesMutation.isLoading

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
            <ComposePost allowImageUpload={allowImageUpload} {...formMethods} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button
              colorScheme="neutral"
              variant="clear"
              onClick={onClose}
              isDisabled={areMutationsLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitReply} isLoading={areMutationsLoading}>
              Reply to post
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
