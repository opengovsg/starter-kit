import {
  ButtonGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  useDisclosure,
} from '@chakra-ui/react'
import { Button, useToast } from '@opengovsg/design-system-react'
import { ComposePost } from '~/features/posts/components/ComposePost'
import { useZodForm } from '~/lib/form'
import { trpc } from '~/utils/trpc'
import { useUploadImagesMutation } from '../api'
import { clientAddPostSchema } from '../schemas/clientAddPostSchema'

const NewPostModal = ({
  onClose: onCloseProp,
  isOpen,
}: Pick<ModalProps, 'isOpen' | 'onClose'>) => {
  const toast = useToast({
    status: 'success',
  })
  const utils = trpc.useContext()

  const uploadImagesMutation = useUploadImagesMutation()

  const formMethods = useZodForm({
    schema: clientAddPostSchema,
  })
  const { handleSubmit, reset } = formMethods

  const addPostMutation = trpc.post.add.useMutation({
    async onSuccess() {
      toast({ description: 'Post success!' })
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create post</ModalHeader>
        <ModalBody>
          <ComposePost {...formMethods} />
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
            <Button onClick={handleSubmitPost} isLoading={areMutationsLoading}>
              Create post
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export const NewPostModalButton = (): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button size="xs" onClick={onOpen}>
        New post
      </Button>
      <NewPostModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
