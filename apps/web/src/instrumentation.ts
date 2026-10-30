export const register = async () => {
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    (process.env.DD_SERVICE ?? '') !== ''
  ) {
    // setup datadog tracing
    const { initTracer, onHttpServerRequest } =
      await import('@acme/logging/tracer')

    initTracer()
    const { tagSpanTrpcProcedure } = await import('~/server/api/tracing')
    const { appRouter } = await import('~/server/api/root')
    const procedureNames = new Set(Object.keys(appRouter._def.procedures))
    onHttpServerRequest((span, req) => {
      tagSpanTrpcProcedure(span, req, procedureNames)
    })
  }
}
