import {
  Box,
  forwardRef,
  SimpleGrid,
  Stack,
  useMultiStyleConfig,
} from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import { BiImageAdd } from 'react-icons/bi'
import { FileButton } from '~/components/FileButton'
import { ACCEPTED_FILE_TYPES } from '~/utils/image'
import { AttachmentFileInfo } from './AttachmentFileInfo'
import { ImageAttachmentButtonStylesProvider } from './ImageAttachmentButtonContext'

export interface ImageAttachmentButtonProps {
  onChange: (value: File[]) => void
  value?: File[]
}

export const ImageAttachmentButton = forwardRef<
  ImageAttachmentButtonProps,
  'button'
>(({ onChange, value = [] }, ref): JSX.Element => {
  const styles = useMultiStyleConfig('Attachment', { imagePreview: 'large' })

  return (
    <ImageAttachmentButtonStylesProvider value={styles}>
      <Stack spacing="1.5rem">
        <SimpleGrid
          // Clamp the number of columns between 1 and 2
          columns={{ base: 1, md: Math.min(Math.max(value.length, 1), 2) }}
          spacing="1.5rem"
        >
          {value.map((file, index) => (
            <AttachmentFileInfo
              imagePreview="large"
              key={index}
              file={file}
              handleRemoveFile={() => {
                onChange(value.filter((_, i) => i !== index))
              }}
            />
          ))}
        </SimpleGrid>
        <FileButton
          multiple
          append
          value={value}
          onChange={onChange}
          accept={ACCEPTED_FILE_TYPES.join(',')}
        >
          {(fileButtonProps) => {
            return (
              <Box>
                <Button
                  {...fileButtonProps}
                  leftIcon={<BiImageAdd fontSize="1.25rem" />}
                  size="xs"
                  type="button"
                  variant="outline"
                  colorScheme="neutral"
                  ref={ref}
                >
                  Add images
                </Button>
              </Box>
            )
          }}
        </FileButton>
      </Stack>
    </ImageAttachmentButtonStylesProvider>
  )
})

ImageAttachmentButton.displayName = 'ImageAttachmentButton'
