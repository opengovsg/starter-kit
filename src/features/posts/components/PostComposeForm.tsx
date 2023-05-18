import { Box, FormControl, FormErrorMessage, Stack } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import { Controller } from 'react-hook-form'
import { Avatar } from '~/components/Avatar'
import { RichText } from '~/components/RichText'
import { useMe } from '~/features/me/api'
import { useZodForm } from '~/lib/form'
import { addPostSchema } from '~/schemas/post'
import { trpc } from '~/utils/trpc'

export const PostComposeForm = (): JSX.Element => {
  const utils = trpc.useContext()
  const { me } = useMe()

  const mutation = trpc.post.add.useMutation({
    async onSuccess() {
      // refetches posts after a post is added
      await utils.post.list.invalidate()
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
    <Box>
      <Avatar name={me?.name ?? ''} src={me?.image ?? ''} />
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
        <FormControl id="post" isRequired isInvalid={!!errors.contentHtml}>
          <Controller
            control={control}
            name="contentHtml"
            render={({ field: { onChange, ...field } }) => (
              <RichText
                placeholder="What's happening?"
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
          Post
        </Button>
      </Stack>
    </Box>
  )
}
