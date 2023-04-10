import { z } from 'zod'
import { protectedProcedure, router } from '~/server/trpc'
import { generateSignedPutUrl } from '~/lib/r2'
import { env } from '~/server/env'

export const storageRouter = router({
  presignAvatar: protectedProcedure
    .output(
      z
        .object({
          url: z.string(),
          key: z.string(),
        })
        .or(z.null())
    )
    .mutation(async ({ ctx }) => {
      if (!env.NEXT_PUBLIC_ENABLE_STORAGE) return null
      const imageKey = `avatar-${ctx.session.user.id}`
      return {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        url: await generateSignedPutUrl(imageKey, env.R2_AVATARS_BUCKET_NAME!),
        key: imageKey,
      }
    }),
})
