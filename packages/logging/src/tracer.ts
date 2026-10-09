import type { IncomingMessage } from 'node:http'

import type { Span } from 'dd-trace'
import { tracer } from 'dd-trace'

export function initTracer() {
  tracer.init()
}

/**
 * Run `hook` on the root HTTP span and Next.js request span before they finish.
 * The APM trace list reads tags from the root HTTP span.
 */
export function onHttpServerRequest(
  hook: (span: Span, req: IncomingMessage) => void
) {
  const request = (span?: Span, req?: IncomingMessage) => {
    if (span && req) hook(span, req)
  }
  tracer.use('http', {
    server: {
      hooks: { request },
    },
  })
  tracer.use('next', { hooks: { request } })
}
