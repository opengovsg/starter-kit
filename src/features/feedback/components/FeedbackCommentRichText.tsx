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
import { addCommentSchema } from '~/schemas/comment'
import { BiSend } from 'react-icons/bi'

interface FeedbackCommentRichTextProps {
  postId: string
}

export const FeedbackCommentRichText = ({
  postId,
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
              placeholder="Tip: Replying is caring"
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
        <Button
          isFullWidth
          leftIcon={<BiSend fontSize="1.25rem" />}
          onClick={handleSubmitFeedback}
        >
          Reply
        </Button>
      </ButtonGroup>
    </Box>
  )
}
