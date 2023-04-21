import { RichText } from '~/components/RichText'
import { useZodForm } from '~/lib/form'

import {
  Box,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
} from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import { Controller } from 'react-hook-form'
import { BiSend } from 'react-icons/bi'
import { z } from 'zod'

interface FeedbackCommentRichTextProps {
  postId: string
}

export const FeedbackCommentRichText = ({
  postId,
}: FeedbackCommentRichTextProps): JSX.Element => {
  // TODO(example): Use trpc.thread.reply mutation here to submit the reply.

  const {
    formState: { errors },
    handleSubmit,
    setValue,
    control,
  } = useZodForm({
    schema: z.object({
      content: z.string().min(1),
      contentHtml: z.string().min(1),
    }),
  })

  const handleSubmitFeedback = handleSubmit((values) => {
    console.log({ postId, ...values })
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
