import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { cloudinary } from '~/lib/cloudinary';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const apiSecret = cloudinary.config().api_secret!;
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const apiKey = cloudinary.config().api_key!;
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const cloudName = cloudinary.config().cloud_name!;

export const imageUploadRouter = router({
  presign: protectedProcedure
    .input(
      z.object({
        folder: z.string(),
        publicId: z.string(),
      }),
    )
    .mutation(async ({ input: { folder, publicId } }) => {
      const timestamp = Math.round(new Date().getTime() / 1000);

      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp,
          folder: folder,
          public_id: publicId,
          media_metadata: true,
        },
        apiSecret,
      );

      return {
        timestamp,
        signature,
        folder,
        publicId,
        apiKey,
        cloudName,
      };
    }),
});
