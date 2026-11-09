import type { IncomingMessage } from 'node:http'

import { initTRPC } from '@trpc/server'
import type { Span } from 'dd-trace'
import { tracer } from 'dd-trace'

const TRAILING_SLASH = /\/$/u

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

  const { url } = req

  if (url === undefined) {
    return
  }

  const queryIndex = url.indexOf('?')
  const pathname = queryIndex === -1 ? url : url.slice(0, queryIndex)

  if (!pathname.startsWith('/api/trpc/')) {
    return
  }

  const path = pathname.slice('/api/trpc/'.length).replace(TRAILING_SLASH, '')

  // Only registered procedures become resources, keeping unknown URLs bounded.
  if (!procedureNames.has(path)) {
    return
  }

  span.setTag('trpc.procedure', path)
  span.setTag('resource.name', `${req.method} /api/trpc/${path}`)
}
