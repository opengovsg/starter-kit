import z from 'zod'

export const trpcHandleableErrorCodeSchema = z.object({
  data: z.object({
    code: z.enum(['FORBIDDEN', 'UNAUTHORIZED', 'NOT_FOUND']),
  }),
})
