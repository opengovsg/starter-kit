import { createTRPCMsw, httpLink } from 'msw-trpc'
import superjson from 'superjson'

import type { AppRouter } from '~/server/api/root'

const hasWindow = () => 'window' in globalThis

const getBaseUrl = () => {
  if (hasWindow()) {
    return globalThis.window.location.origin
  }
  return 'http://localhost:6006'
}

export const trpcMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: `${getBaseUrl()}/api/trpc` })],
  transformer: {
    input: superjson,
    output: superjson,
  },
})
