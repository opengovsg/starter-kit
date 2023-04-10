import { z } from 'zod'
import { generateSignedPutUrl } from '~/lib/r2'
import { env } from '~/server/env'
import { protectedProcedure, router } from '~/server/trpc'

export const storageRouter = router({
  presignAvatar: protectedProcedure
    .input(
      z.object({
        fileContentType: z.string(),
      })
    )
    .output(
      z
        .object({
          url: z.string(),
          key: z.string(),
        })
        .or(z.null())
    )
    .mutation(async ({ ctx, input: { fileContentType } }) => {
      if (!env.NEXT_PUBLIC_ENABLE_STORAGE) return null
      const imageKey = `${ctx.session.user.id}/avatar-${Date.now()}`

      return {
        url: await generateSignedPutUrl({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          Bucket: env.R2_AVATARS_BUCKET_NAME!,
          Key: imageKey,
          ACL: 'public-read',
          ContentType: fileContentType,
        }),
        key: imageKey,
      }
    }),
})
