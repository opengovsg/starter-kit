import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  type ModalProps,
} from '@chakra-ui/react'
import {
  Button,
  ModalCloseButton,
  useToast,
} from '@opengovsg/design-system-react'
import { ResponsiveModal } from '~/components/ResponsiveModal'
import { useZodForm } from '~/lib/form'
import { trpc, type RouterOutput } from '~/utils/trpc'
import { useUploadImagesMutation } from '../../api'
import { clientAddReplySchema } from '../../schemas/clientAddPostSchema'
import { ComposePost } from '../ComposePost'
import { PostView } from '../Post/PostView'
import { ResponsiveModalButtonGroup } from '~/components/ResponsiveModalButtonGroup'
import { ResponsiveButton } from '~/components/ResponsiveButton'

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
  const { handleSubmit, reset, watch } = formMethods

  const watchedContent = watch('content')

  const replyThreadMutation = trpc.thread.reply.useMutation({
    onSuccess: async () => {
      toast({ description: 'Your reply was sent' })
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
    <ResponsiveModal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>Reply post</ModalHeader>
        <ModalBody>
          <Stack spacing="1.5rem">
            <PostView
              containerProps={{
                px: 0,
                mx: 0,
              }}
              post={parentPost}
              hideActions
            />
            <ComposePost
              showAvatar
              allowImageUpload={allowImageUpload}
              {...formMethods}
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <ResponsiveModalButtonGroup>
            <Button
              display={{
                base: 'none',
                md: 'block',
              }}
              colorScheme="neutral"
              variant="clear"
              onClick={onClose}
              isDisabled={areMutationsLoading}
            >
              Cancel
            </Button>
            <ResponsiveButton
              onClick={handleSubmitReply}
              isDisabled={!watchedContent}
              isLoading={areMutationsLoading}
            >
              Reply to post
            </ResponsiveButton>
          </ResponsiveModalButtonGroup>
          {/* <ButtonGroup>
            <Button
              colorScheme="neutral"
              variant="clear"
              onClick={onClose}
              isDisabled={areMutationsLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReply}
              isDisabled={!watchedContent}
              isLoading={areMutationsLoading}
            >
              Reply to post
            </Button>
          </ButtonGroup> */}
        </ModalFooter>
      </ModalContent>
    </ResponsiveModal>
  )
}
