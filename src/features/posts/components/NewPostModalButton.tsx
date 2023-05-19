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
import { addPostSchema } from '~/schemas/post'
import { trpc } from '~/utils/trpc'

const NewPostModal = ({
  onClose,
  isOpen,
}: Pick<ModalProps, 'isOpen' | 'onClose'>) => {
  const toast = useToast({
    status: 'success',
  })
  const utils = trpc.useContext()

  const formMethods = useZodForm({
    schema: addPostSchema,
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

  const handleSubmitPost = handleSubmit((values) =>
    addPostMutation.mutate(values)
  )

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
              isDisabled={addPostMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitPost}
              isLoading={addPostMutation.isLoading}
            >
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
