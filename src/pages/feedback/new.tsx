import {
  Container,
  Flex,
  FormControl,
  HStack,
  Stack,
  Text,
  VStack,
  FormLabel,
} from '@chakra-ui/react'
import {
  Button,
  FormErrorMessage,
  Infobox,
  Toggle,
} from '@opengovsg/design-system-react'
import { useRouter } from 'next/router'
import { Controller } from 'react-hook-form'
import { FeedbackNavbar } from '~/features/feedback/components'
import { useZodForm } from '~/lib/form'
import { NextPageWithLayout } from '~/lib/types'
import { addPostSchema } from '~/schemas/post'
import { trpc } from '~/utils/trpc'
import Image from 'next/image'

import feedbackUncleSvg from '~/features/feedback/assets/feedback-uncle.svg'
import { RichText } from '~/components/RichText'
import { useUser } from '~/features/profile/api'

const PostFeedbackPage: NextPageWithLayout = () => {
  const utils = trpc.useContext()
  const { user } = useUser()

  const router = useRouter()

  const mutation = trpc.post.add.useMutation({
    async onSuccess({ id }) {
      // refetches posts after a post is added
      await utils.post.list.invalidate()
      router.push(`/dashboard?feedbackId=${id}`)
    },
  })

  const {
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
    register,
    control,
  } = useZodForm({
    schema: addPostSchema,
    defaultValues: {
      anonymous: false,
    },
  })

  const isAnonymous = watch('anonymous')

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
          <Image src={feedbackUncleSvg} aria-hidden alt="Feedback uncle" />
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
          <FormControl id="anonymous">
            <Stack>
              <Toggle label="Post anonymously?" {...register('anonymous')} />
              {isAnonymous ? (
                <Infobox>
                  Only your team name will be visible. If your team has less
                  than five members, we won’t reveal your team to protect your
                  identity.
                </Infobox>
              ) : (
                <Text>Posting as {user?.name ?? user?.email}</Text>
              )}
            </Stack>
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
