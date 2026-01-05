import { tracer } from 'dd-trace'

import { env } from './env'

export function initTracer({ service }: { service?: string } = {}) {
  if (!service) {
    return
  }
  tracer.init({
    service: service,
    env: env.NEXT_PUBLIC_ENVIRONMENT,
    version: env.NEXT_PUBLIC_APP_VERSION,
    logInjection: true,
    runtimeMetrics: true,
    reportHostname: true,
    profiling: env.NODE_ENV === 'production',
  })
}
