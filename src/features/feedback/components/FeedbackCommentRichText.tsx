import { RichText } from '~/components/RichText'
import { useZodForm } from '~/lib/form'
import { trpc } from '~/utils/trpc'

import {
  Box,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
} from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import { Controller } from 'react-hook-form'
import { addCommentSchema } from '~/server/schemas/comment'

interface FeedbackCommentRichTextProps {
  postId: string
  handleCancel: () => void
}

export const FeedbackCommentRichText = ({
  postId,
  handleCancel,
}: FeedbackCommentRichTextProps): JSX.Element => {
  const utils = trpc.useContext()
  const mutation = trpc.comment.add.useMutation({
    async onSuccess() {
      reset()
      // refetches posts after a comment is added
      await utils.post.list.invalidate()
      await utils.post.byId.invalidate({ id: postId })
    },
  })

  const {
    formState: { errors },
    handleSubmit,
    setValue,
    control,
    reset,
  } = useZodForm({
    schema: addCommentSchema,
    defaultValues: {
      postId,
    },
  })

  const handleSubmitFeedback = handleSubmit((values) => {
    return mutation.mutateAsync(values)
  })

  return (
    <Box>
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
      <ButtonGroup w="100%" justifyContent="end" mt="1rem">
        <Button variant="outline" mr={3} onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmitFeedback}>Save</Button>
      </ButtonGroup>
    </Box>
  )
}
