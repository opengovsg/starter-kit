/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { z } from 'zod'

import { protectedProcedure, router } from '~/server/trpc'

export const meRouter = router({
  get: protectedProcedure
    .meta({
      openapi: {
        protect: true,
        method: 'GET',
        path: '/users/me',
      },
    })
    .input(z.object({}).optional())
    .output(
      z.object({
        id: z.string(),
        email: z.string(),
        name: z.string().nullable(),
        image: z.string().nullable(),
      }),
    )
    .query(async ({ ctx }) => {
      // Remember to write a new query if you want to return something different than what
      // the authMiddleware in protectedProcedure returns.
      return ctx.user
    }),
})
