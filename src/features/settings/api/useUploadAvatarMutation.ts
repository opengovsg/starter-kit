import { useMutation } from '@tanstack/react-query'
import { useMe } from '~/features/me/api'
import { type AcceptedImageFileTypes, ACCEPTED_FILE_TYPES } from '~/utils/image'
import { trpc } from '~/utils/trpc'

export const useUploadAvatarMutation = () => {
  const utils = trpc.useContext()
  const { me } = useMe()
  // Pre-upload: Create a mutation to presign the upload request
  const presignImageUploadMutation = trpc.storage.presignAvatar.useMutation()

  // Post-upload: Create a mutation to update the user's avatar link
  const updateAvatarLinkMutation = trpc.me.updateAvatar.useMutation({
    onSuccess: () => utils.me.get.invalidate(),
  })

  return useMutation(
    async (image: File) => {
      if (!me?.id) throw new Error('No user found')
      if (!ACCEPTED_FILE_TYPES.some((type) => type === image.type)) {
        throw new Error(
          `File type ${image.type} is not supported. Please upload an image.`,
        )
      }

      const presign = await presignImageUploadMutation.mutateAsync({
        fileContentType: image.type as AcceptedImageFileTypes,
      })
      if (!presign) throw new Error('No presign generated')

      const { url, key } = presign

      const response = await fetch(url, {
        headers: {
          'Content-Type': image.type,
        },
        method: 'PUT',
        body: image,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      return key
    },
    {
      onSuccess: (key) => {
        return updateAvatarLinkMutation.mutate({ imageKey: key })
      },
    },
  )
}
