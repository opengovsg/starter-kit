import { z } from 'zod'
import { generateSignedPutUrl } from '~/lib/r2'
import { env } from '~/env.mjs'
import { protectedProcedure, router } from '~/server/trpc'
import { TRPCError } from '@trpc/server'

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
      if (!env.NEXT_PUBLIC_ENABLE_STORAGE || !env.R2_AVATARS_BUCKET_NAME) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Avatar upload feature is not enabled',
        })
      }
      const imageKey = `${ctx.session.user.id}/avatar-${Date.now()}`

      return {
        url: await generateSignedPutUrl({
          Bucket: env.R2_AVATARS_BUCKET_NAME,
          Key: imageKey,
          ACL: 'public-read',
          ContentType: fileContentType,
        }),
        key: imageKey,
      }
    }),
})
