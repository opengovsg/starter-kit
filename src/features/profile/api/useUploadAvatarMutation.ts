import { useMutation } from '@tanstack/react-query';
import { UploadApiResponse } from 'cloudinary';
import { trpc } from '~/utils/trpc';

export const useUploadAvatarMutation = () => {
  const utils = trpc.useContext();
  // Pre-upload: Create a mutation to presign the upload request
  const presignImageUploadMutation = trpc.imageUpload.presign.useMutation();

  // Post-upload: Create a mutation to update the user's avatar link
  const updateAvatarLinkMutation = trpc.me.updateAvatar.useMutation({
    onSuccess: () => utils.me.get.invalidate(),
  });

  return useMutation(
    async (image: File) => {
      const { signature, timestamp, apiKey, cloudName, folder } =
        await presignImageUploadMutation.mutateAsync({
          folder: 'avatars',
        });

      // The formData object MUST also contain `image_metadata` set to `true` as
      // that is used in signature generation.
      // The formData object MUST also contain the `signature`, `timestamp` and
      // `folder` props, returned from the presigned function as the signature is
      // also derived from those parameters.
      const formData = new FormData();
      formData.append('file', image);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      formData.append('folder', folder);
      formData.append('image_metadata', 'true');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        },
      );
      const data = (await response.json()) as UploadApiResponse;

      return data.secure_url;
    },
    {
      onSuccess: (newAvatarUrl) => {
        return updateAvatarLinkMutation.mutate({ image: newAvatarUrl });
      },
    },
  );
};
