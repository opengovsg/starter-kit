import { createFileRoute } from '@tanstack/react-router'

import { createApiCaller, handleTRPCError } from '~/app/api/helpers'

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const caller = await createApiCaller(request)
          const result = await caller.healthcheck()
          return Response.json(result, { status: 200 })
        } catch (e) {
          return handleTRPCError(e, 'Healthcheck failed')
        }
      },
    },
  },
})
