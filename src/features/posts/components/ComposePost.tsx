import { FormControl, Stack } from '@chakra-ui/react'
import { FormErrorMessage } from '@opengovsg/design-system-react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { Avatar } from '~/components/Avatar'
import { ImageAttachmentButton } from '~/components/ImageAttachmentButton'
import { RichText } from '~/components/RichText'
import { useMe } from '~/features/me/api'
import { type ClientAddPostSchema } from '../schemas/clientAddPostSchema'
export interface ComposePostProps extends UseFormReturn<ClientAddPostSchema> {
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
      <Stack direction="column">
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
        <FormControl>
          <Controller
            control={control}
            name="images"
            render={({ field }) => <ImageAttachmentButton {...field} />}
          />
        </FormControl>
      </Stack>
    </Stack>
  )
}
