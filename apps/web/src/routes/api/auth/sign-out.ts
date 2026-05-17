import { createFileRoute } from '@tanstack/react-router'

import { LOGIN_ROUTE } from '~/constants'
import { getSession } from '~/server/session.server'

export const Route = createFileRoute('/api/auth/sign-out')({
  server: {
    handlers: {
      GET: async () => {
        const session = await getSession()
        session.destroy()
        return new Response(null, {
          status: 302,
          headers: { Location: LOGIN_ROUTE },
        })
      },
    },
  },
})
