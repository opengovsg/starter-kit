import { createBaseLogger } from '@acme/logging'

import { env } from '~/env'

// Used to check the app version from the client
export const APP_VERSION_HEADER_KEY = 'X-App-Version'

export const createLogger = ({
  path,
  headers,
}: {
  path: string
  headers: Headers
}) =>
  createBaseLogger({
    path,
    // We need to manually inject the trace ID from the frontend otherwise logs
    // and traces will not be correlated to the RUM session.
    source: headers.get('x-trpc-source') ?? 'unknown',
    traceId: headers.get('x-datadog-trace-id') ?? undefined,
    cfConnectingIp: headers.get('cf-connecting-ip') ?? undefined,
    userAgent: headers.get('user-agent') ?? undefined,
    serverVersion: env.NEXT_PUBLIC_APP_VERSION,
    clientVersion: headers.get(APP_VERSION_HEADER_KEY) ?? undefined,
  })
