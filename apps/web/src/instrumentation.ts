export const register = async () => {
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    process.env.DD_SERVICE !== undefined
  ) {
    const { initTracer } = await import('@acme/logging/tracer')
    initTracer({ service: process.env.DD_SERVICE })
  }
}
