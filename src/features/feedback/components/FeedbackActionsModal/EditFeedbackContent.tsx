import {
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
} from '@chakra-ui/react'
import {
  FormErrorMessage,
  ModalCloseButton,
} from '@opengovsg/design-system-react'
import { useAtomValue } from 'jotai'
import { Controller } from 'react-hook-form'
import { RichText } from '~/components/RichText'
import { useZodForm } from '~/lib/form'
import { editPostSchema } from '~/schemas/post'
import { trpc } from '~/utils/trpc'
import { actionStateAtom } from '../../api/actionState'

interface FeedbackContentProps {
  onClose: () => void
}

export const EditFeedbackContent = ({ onClose }: FeedbackContentProps) => {
  const { post } = useAtomValue(actionStateAtom)
  const utils = trpc.useContext()

  const editMutation = trpc.post.edit.useMutation({
    onSuccess: () => {
      utils.post.list.invalidate()
      onClose()
    },
  })

  const {
    formState: { errors },
    handleSubmit,
    setValue,
    control,
  } = useZodForm({
    schema: editPostSchema.omit({ id: true }),
    defaultValues: {
      contentHtml: post?.contentHtml,
      content: post?.content,
    },
  })

  const handleEditFeedback = handleSubmit((values) => {
    if (!post) return
    return editMutation.mutate({
      id: post.id,
      ...values,
    })
  })

  return (
    <ModalContent>
      <ModalCloseButton />
      <ModalHeader>Edit feedback</ModalHeader>
      <ModalBody>
        <FormControl isRequired isInvalid={!!errors.contentHtml}>
          <Controller
            control={control}
            name="contentHtml"
            render={({ field: { onChange, ...field } }) => (
              <RichText
                {...field}
                onChange={(value, rawValue) => {
                  onChange(value)
                  setValue('content', rawValue ?? '')
                }}
              />
            )}
          />
          <FormErrorMessage>{errors.contentHtml?.message}</FormErrorMessage>
        </FormControl>
      </ModalBody>
      <ModalFooter>
        <Button
          colorScheme="main"
          variant="solid"
          onClick={handleEditFeedback}
          isLoading={editMutation.isLoading}
        >
          Save
        </Button>
      </ModalFooter>
    </ModalContent>
  )
}
