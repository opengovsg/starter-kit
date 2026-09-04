import { tracer } from 'dd-trace'

import { env } from './env'

export const initTracer = ({ service }: { service?: string } = {}) => {
  if (service === undefined || service === '') {
    return
  }
  tracer.init({
    env: env.NEXT_PUBLIC_APP_ENV,
    logInjection: true,
    profiling: env.NODE_ENV === 'production',
    reportHostname: true,
    runtimeMetrics: true,
    service,
    version: env.NEXT_PUBLIC_APP_VERSION,
  })
}
