import { generateSignedPutUrl } from '~/lib/r2'
import { createId } from '@paralleldrive/cuid2'
import {
  presignImageInputSchema,
  presignImageOutputSchema,
} from '~/schemas/presign'
import { protectedProcedure, router } from '~/server/trpc'
import { env } from '~/env.mjs'

export const storageRouter = router({
  presignAvatar: protectedProcedure
    .input(presignImageInputSchema)
    .output(presignImageOutputSchema)
    .mutation(async ({ ctx, input: { fileContentType } }) => {
      if (!env.NEXT_PUBLIC_ENABLE_STORAGE || !env.R2_AVATARS_DIRECTORY) {
        return null
      }
      const imageKey = `${env.R2_AVATARS_DIRECTORY}/${
        ctx.session.user.id
      }/avatar-${Date.now()}`

      return {
        url: await generateSignedPutUrl({
          Bucket: env.R2_BUCKET_NAME,
          Key: imageKey,
          ACL: 'public-read',
          ContentType: fileContentType,
        }),
        key: imageKey,
      }
    }),
  presignPostImage: protectedProcedure
    .input(presignImageInputSchema)
    .output(presignImageOutputSchema)
    .mutation(async ({ input: { fileContentType } }) => {
      if (!env.NEXT_PUBLIC_ENABLE_STORAGE || !env.R2_IMAGES_DIRECTORY) {
        return null
      }
      const imageKey = `${env.R2_IMAGES_DIRECTORY}/${createId()}-${Date.now()}`

      return {
        url: await generateSignedPutUrl({
          Bucket: env.R2_BUCKET_NAME,
          Key: imageKey,
          ACL: 'public-read',
          ContentType: fileContentType,
        }),
        key: imageKey,
      }
    }),
})
