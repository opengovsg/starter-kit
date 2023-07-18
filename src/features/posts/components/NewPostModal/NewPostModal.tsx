import {
  ButtonGroup,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  type ModalProps,
} from '@chakra-ui/react'
import { Button, useToast } from '@opengovsg/design-system-react'
import { ResponsiveModal } from '~/components/ResponsiveModal'
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
        <ModalHeader>Create post</ModalHeader>
        <ModalBody>
          <ComposePost allowImageUpload={allowImageUpload} {...formMethods} />
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
            <Button
              onClick={handleSubmitPost}
              isDisabled={!watchedContent}
              isLoading={areMutationsLoading}
            >
              Create post
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </ResponsiveModal>
  )
}
