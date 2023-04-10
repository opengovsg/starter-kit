import { useMutation } from '@tanstack/react-query'
import { trpc } from '~/utils/trpc'
import { useUser } from './useUser'

export const useUploadAvatarMutation = () => {
  const utils = trpc.useContext()
  const { user } = useUser()
  // Pre-upload: Create a mutation to presign the upload request
  const presignImageUploadMutation = trpc.storage.presignAvatar.useMutation()

  // Post-upload: Create a mutation to update the user's avatar link
  const updateAvatarLinkMutation = trpc.me.updateAvatar.useMutation({
    onSuccess: () => utils.me.get.invalidate(),
  })

  return useMutation(
    async (image: File) => {
      if (!user?.id) throw new Error('No user found')

      const presign = await presignImageUploadMutation.mutateAsync({
        fileContentType: image.type,
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
    }
  )
}
