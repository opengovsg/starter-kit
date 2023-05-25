import {
  Container,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import {
  Button,
  FormErrorMessage,
  useToast,
} from '@opengovsg/design-system-react'
import { useRouter } from 'next/router'
import { Controller } from 'react-hook-form'
import {
  FeedbackNavbar,
  FeedbackUncleSvgr,
} from '~/features/feedback/components'
import { useZodForm } from '~/lib/form'
import { type NextPageWithLayout } from '~/lib/types'
import { addPostSchema } from '~/schemas/post'
import { trpc } from '~/utils/trpc'

import { RichText } from '~/components/RichText'
import { FEEDBACK } from '~/constants/routes'

const PostFeedbackPage: NextPageWithLayout = () => {
  const utils = trpc.useContext()
  const toast = useToast({
    status: 'error',
  })

  const router = useRouter()

  const mutation = trpc.post.add.useMutation({
    async onSuccess({ id }) {
      // refetches posts after a post is added
      await utils.post.list.invalidate()
      router.push(`${FEEDBACK}/${id}`)
    },
    onError: (error) => {
      toast({ description: error.message })
    },
  })

  const {
    formState: { errors },
    handleSubmit,
    setValue,
    control,
  } = useZodForm({
    schema: addPostSchema,
  })

  const handleSubmitFeedback = handleSubmit((values) => mutation.mutate(values))

  return (
    <Flex flexDir="column" bg="base.canvas.brand-subtle" minH="$100vh">
      <FeedbackNavbar />
      <Container flex={1} p="1rem" maxW="45rem">
        <HStack justify="space-between">
          <VStack align="start">
            <Text textStyle="h5" color="base.content.strong">
              Write feedback
            </Text>
            <Text textStyle="subhead-2" mb="2.5rem">
              Share your concerns and ideas directly with your organization.
            </Text>
          </VStack>
          <FeedbackUncleSvgr aria-hidden />
        </HStack>
        <Stack
          spacing="2rem"
          as="form"
          borderWidth="1px"
          borderColor="base.divider.medium"
          borderRadius="lg"
          onSubmit={handleSubmitFeedback}
          bg="white"
          py="2.5rem"
          px="3.5rem"
        >
          <FormControl
            id="feedback"
            isRequired
            isInvalid={!!errors.contentHtml}
          >
            <FormLabel>What&apos;s on your mind?</FormLabel>
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
          <Button
            mt="2.5rem"
            type="submit"
            isLoading={mutation.isLoading}
            isFullWidth
          >
            Submit feedback
          </Button>
        </Stack>
      </Container>
    </Flex>
  )
}

export default PostFeedbackPage
