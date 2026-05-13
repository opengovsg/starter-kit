export async function register() {
  // oxlint-disable-next-line no-restricted-properties
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // oxlint-disable-next-line no-restricted-properties
    if (process.env.DD_SERVICE !== undefined) {
      // setup datadog tracing
      const { initTracer } = await import('@acme/logging/tracer')
      // oxlint-disable-next-line no-restricted-properties
      initTracer({ service: process.env.DD_SERVICE })
    }
  }
}
