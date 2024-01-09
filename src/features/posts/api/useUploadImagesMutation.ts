import { useMutation } from '@tanstack/react-query'
import { trpc } from '~/utils/trpc'
import wretch from 'wretch'
import { type AcceptedImageFileTypes, ACCEPTED_FILE_TYPES } from '~/utils/image'

export const useUploadImagesMutation = () => {
  // Pre-upload: Create a mutation to presign the upload request
  const presignImageUploadMutation = trpc.storage.presignPostImage.useMutation()

  const uploadImagesMutation = useMutation(async (images?: File[]) => {
    if (!images) return
    const presignMetadata = await Promise.all(
      images.map((image) => {
        if (!ACCEPTED_FILE_TYPES.some((type) => type === image.type)) {
          throw new Error(
            `File type ${image.type} is not supported. Please upload an image.`,
          )
        }
        return presignImageUploadMutation.mutateAsync({
          fileContentType: image.type as AcceptedImageFileTypes,
        })
      }),
    )

    // Upload all images in parallel
    const keys = await Promise.all(
      images.map(async (image, index) => {
        const presign = presignMetadata[index]
        if (!presign) throw new Error('No presign generated')
        const { url, key } = presign

        await wretch(url).content(image.type).put(image).res()
        return key
      }),
    )
    return keys
  })

  return uploadImagesMutation
}
