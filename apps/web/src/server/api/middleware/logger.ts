import { getHTTPStatusCodeFromError } from '@trpc/server/http'

import { t } from '../trpc-init'

import { createLogger } from '~/lib/logger'

export const loggerMiddleware = t.middleware(async ({ ctx, next, path }) => {
  const start = performance.now()

  // Rebuild the logger so the procedure path lands in the root `path` field
  // (not the action) and the session is surfaced as user_id / correlation_id.
  const logger = createLogger({
    headers: ctx.headers,
    path,
    sessionId: ctx.session.sessionId,
    userId: ctx.session.userId,
  }).scope({ action: 'request' })

  // oxlint-disable-next-line node/callback-return -- tRPC middleware must await before logging the result.
  const result = await next({
    ctx: { logger },
  })

  const end = performance.now()
  const durationInMs = Math.round(end - start)

  if (result.ok) {
    logger.info({
      merged: {
        durationInMs,
        statusCode: 200,
      },
      message: 'Request OK',
    })
  } else {
    const statusCode = getHTTPStatusCodeFromError(result.error)

    // Keep the message stable for aggregation; the error (and its message)
    // travel in the `error` field.
    const logPayload = {
      error: result.error,
      merged: {
        durationInMs,
        statusCode,
      },
      message: 'Request failed',
    }

    if (statusCode >= 500) {
      logger.error(logPayload)
    } else {
      logger.warn(logPayload)
    }
  }

  return result
})
