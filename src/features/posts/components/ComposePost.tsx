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
  allowImageUpload?: boolean
  showAvatar?: boolean
}

export const ComposePost = ({
  placeholder,
  allowImageUpload,
  showAvatar,
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
      {showAvatar && (
        <Avatar
          variant="subtle"
          bg="base.canvas.brand-subtle"
          size="md"
          src={me?.image}
          name={me?.username}
        />
      )}
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
        {allowImageUpload && (
          <FormControl>
            <Controller
              control={control}
              name="images"
              render={({ field }) => <ImageAttachmentButton {...field} />}
            />
          </FormControl>
        )}
      </Stack>
    </Stack>
  )
}
