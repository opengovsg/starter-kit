import { FormControl, Stack } from '@chakra-ui/react'
import { FormErrorMessage } from '@opengovsg/design-system-react'
import { Controller, UseFormReturn } from 'react-hook-form'
import { Avatar } from '~/components/Avatar'
import { RichText } from '~/components/RichText'
import { useMe } from '~/features/me/api'
import { AddReplySchema } from '~/schemas/thread'

export interface ComposePostProps
  extends UseFormReturn<Omit<AddReplySchema, 'postId'>> {
  placeholder?: string
}

export const ComposePost = ({
  placeholder,
  ...props
}: ComposePostProps): JSX.Element => {
  const {
    control,
    setValue,
    formState: { errors },
  } = props

  const { me } = useMe()

  return (
    <Stack direction="row">
      <Avatar size="md" src={me?.image} name={me?.username} />
      <FormControl isRequired isInvalid={!!errors.contentHtml}>
        <Controller
          control={control}
          name="contentHtml"
          render={({ field: { onChange, ...field } }) => (
            <RichText
              placeholder={placeholder}
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
    </Stack>
  )
}
