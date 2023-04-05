import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'
import { generateSignedPutUrl } from '~/lib/r2'

export const imageUploadRouter = router({
  presign: protectedProcedure
    .output(
      z.object({
        url: z.string(),
        key: z.string(),
      })
    )
    .mutation(async ({ ctx }) => {
      const imageKey = `avatar-${ctx.session.user.id}`
      return {
        url: await generateSignedPutUrl(imageKey),
        key: imageKey,
      }
    }),
})
