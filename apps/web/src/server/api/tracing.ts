import type { IncomingMessage } from 'node:http'

import { initTRPC } from '@trpc/server'
import type { Span } from 'dd-trace'
import { tracer } from 'dd-trace'

export const tracingMiddleware = initTRPC.create().middleware(
  async ({ path, type, next }) =>
    await tracer.trace(
      'trpc.procedure',
      { resource: path, tags: { 'trpc.procedure': path, 'trpc.type': type } },
      async (span) => {
        // oxlint-disable-next-line node/callback-return -- tRPC middleware must await before tagging the span.
        const result = await next()

        // tRPC returns middleware errors rather than throwing them.
        if (!result.ok) {
          span?.setTag('error', result.error)
        }

        return result
      }
    )
)

export const tagSpanTrpcProcedure = (
  span: Pick<Span, 'setTag'>,
  req: Pick<IncomingMessage, 'method' | 'url'>,
  procedureNames: ReadonlySet<string>
) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return
  }

  const pathname = req.url?.split('?')[0]

  if (pathname?.startsWith('/api/trpc/') !== true) {
    return
  }

  const path = pathname.slice('/api/trpc/'.length).replace(/\/$/u, '')

  // Only registered procedures become resources, keeping unknown URLs bounded.
  if (!procedureNames.has(path)) {
    return
  }

  span.setTag('trpc.procedure', path)
  span.setTag('resource.name', `${req.method} /api/trpc/${path}`)
}
