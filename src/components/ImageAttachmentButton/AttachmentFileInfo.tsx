import { useEffect, useMemo, useState } from 'react'
import {
  Flex,
  forwardRef,
  Image,
  Stack,
  Text,
  VisuallyHidden,
} from '@chakra-ui/react'
import { dataAttr } from '@chakra-ui/utils'
import { useImageAttachmentButtonStyles } from './ImageAttachmentButtonContext'
import { getReadableFileSize, IconButton } from '@opengovsg/design-system-react'
import { BiTrash } from 'react-icons/bi'

export interface AttachmentFileInfoProps {
  file: File
  handleRemoveFile: () => void
  imagePreview?: 'small' | 'large'
  isDisabled?: boolean
  isReadOnly?: boolean
}

export const AttachmentFileInfo = forwardRef<AttachmentFileInfoProps, 'div'>(
  ({ file, handleRemoveFile, imagePreview, isDisabled, isReadOnly }, ref) => {
    const [previewSrc, setPreviewSrc] = useState('')
    const styles = useImageAttachmentButtonStyles()
    const readableFileSize = useMemo(
      () => getReadableFileSize(file.size),
      [file.size],
    )

    useEffect(() => {
      let objectUrl = ''
      // create the preview
      if (file.type.startsWith('image/')) {
        objectUrl = URL.createObjectURL(file)
        setPreviewSrc(objectUrl)
      }

      // free memory when ever this component is unmounted
      return () => URL.revokeObjectURL(objectUrl)
    }, [file])

    return (
      <Flex aria-disabled={isDisabled} ref={ref} sx={styles.fileInfoContainer}>
        <VisuallyHidden>
          File attached: {file.name} with file size of {readableFileSize}
        </VisuallyHidden>
        {imagePreview && previewSrc && (
          <Image
            maxH={{ base: '15rem' }}
            alt="uploaded image preview"
            __css={styles.fileInfoImage}
            flex={imagePreview ? 1 : undefined}
            src={previewSrc}
          />
        )}
        <Flex
          __css={styles.fileInfo}
          flex={imagePreview && imagePreview === 'large' ? 0 : 1}
        >
          <Stack spacing="0.25rem" flexDir="column" aria-hidden>
            <Text textStyle="caption-1" noOfLines={1} title={file.name}>
              {file.name}
            </Text>
            <Text
              data-disabled={dataAttr(isDisabled)}
              sx={styles.fileInfoDescription}
            >
              {readableFileSize}
            </Text>
          </Stack>
          <IconButton
            size="xs"
            variant="clear"
            colorScheme="critical"
            aria-label="Remove file"
            icon={<BiTrash />}
            onClick={handleRemoveFile}
            isDisabled={isDisabled || isReadOnly}
          />
        </Flex>
      </Flex>
    )
  },
)

AttachmentFileInfo.displayName = 'AttachmentFileInfo'
