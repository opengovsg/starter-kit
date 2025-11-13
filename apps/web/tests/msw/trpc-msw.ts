import { createTRPCMsw, httpLink } from 'msw-trpc'
import SuperJSON from 'superjson'

import type { AppRouter } from '~/server/api/root'

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin
  return 'http://localhost:6006'
}

export const trpcMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: `${getBaseUrl()}/api/trpc` })],
  transformer: {
    input: SuperJSON,
    output: SuperJSON,
  },
})
