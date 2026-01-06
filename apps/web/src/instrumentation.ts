export async function register() {
  // eslint-disable-next-line no-restricted-properties, turbo/no-undeclared-env-vars
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // eslint-disable-next-line no-restricted-properties
    if (process.env.DD_SERVICE !== undefined) {
      // setup datadog tracing
      const { initTracer } = await import('@acme/logging/tracer')
      // eslint-disable-next-line no-restricted-properties
      initTracer({ service: process.env.DD_SERVICE })
    }
  }
}
