import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  type ModalProps,
} from '@chakra-ui/react'
import {
  Button,
  ModalCloseButton,
  useToast,
} from '@opengovsg/design-system-react'
import { ResponsiveButton } from '~/components/ResponsiveButton'
import { ResponsiveModal } from '~/components/ResponsiveModal'
import { ResponsiveModalButtonGroup } from '~/components/ResponsiveModalButtonGroup'
import { ComposePost } from '~/features/posts/components'
import { useZodForm } from '~/lib/form'
import { trpc } from '~/utils/trpc'
import { useUploadImagesMutation } from '../../api'
import { clientAddPostSchema } from '../../schemas/clientAddPostSchema'

export interface NewPostModalProps
  extends Pick<ModalProps, 'isOpen' | 'onClose'> {
  allowImageUpload?: boolean
}

export const NewPostModal = ({
  allowImageUpload,
  onClose: onCloseProp,
  isOpen,
}: NewPostModalProps) => {
  const toast = useToast({
    status: 'success',
  })
  const utils = trpc.useContext()

  const uploadImagesMutation = useUploadImagesMutation()

  const formMethods = useZodForm({
    schema: clientAddPostSchema,
  })
  const { handleSubmit, reset, watch } = formMethods

  const watchedContent = watch('content')

  const addPostMutation = trpc.post.add.useMutation({
    async onSuccess() {
      toast({ description: 'You’ve created a post successfully' })
      reset()
      onClose()
      await utils.post.invalidate()
    },
  })

  const handleSubmitPost = handleSubmit(async ({ images, ...rest }) => {
    return uploadImagesMutation.mutate(images, {
      onSuccess: (uploadedImageKeys) => {
        return addPostMutation.mutate({ ...rest, imageKeys: uploadedImageKeys })
      },
    })
  })

  const areMutationsLoading =
    addPostMutation.isLoading || uploadImagesMutation.isLoading

  const onClose = () => {
    reset()
    onCloseProp?.()
  }

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>Create post</ModalHeader>
        <ModalBody>
          <ComposePost allowImageUpload={allowImageUpload} {...formMethods} />
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
              onClick={handleSubmitPost}
              isDisabled={!watchedContent}
              isLoading={areMutationsLoading}
            >
              Create post
            </ResponsiveButton>
          </ResponsiveModalButtonGroup>
        </ModalFooter>
      </ModalContent>
    </ResponsiveModal>
  )
}
