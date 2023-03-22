import { useMutation } from '@tanstack/react-query';
import { UploadApiResponse } from 'cloudinary';
import { trpc } from '~/utils/trpc';
import { useUser } from './useUser';

export const useUploadAvatarMutation = () => {
  const utils = trpc.useContext();
  const { user } = useUser();
  // Pre-upload: Create a mutation to presign the upload request
  const presignImageUploadMutation = trpc.imageUpload.presign.useMutation();

  // Post-upload: Create a mutation to update the user's avatar link
  const updateAvatarLinkMutation = trpc.me.updateAvatar.useMutation({
    onSuccess: () => utils.me.get.invalidate(),
  });

  return useMutation(
    async (image: File) => {
      if (!user?.id) return;

      const { signature, timestamp, apiKey, publicId, cloudName, folder } =
        await presignImageUploadMutation.mutateAsync({
          publicId: user.id,
          folder: 'avatars',
        });

      // The formData object MUST also contain `media_metadata` set to `true` as
      // that is used in signature generation.
      // The formData object MUST also contain the `signature`, `timestamp` and
      // `folder` props, returned from the presigned function as the signature is
      // also derived from those parameters.
      const formData = new FormData();
      formData.append('file', image);
      formData.append('public_id', publicId);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      formData.append('folder', folder);
      formData.append('media_metadata', 'true');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        },
      );
      const data = (await response.json()) as UploadApiResponse;

      if (data.error) throw new Error(data.error.message);

      return data.secure_url;
    },
    {
      onSuccess: (newAvatarUrl) => {
        return updateAvatarLinkMutation.mutate({ image: newAvatarUrl });
      },
    },
  );
};
