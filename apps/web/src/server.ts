import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'
import { createServerEntry } from '@tanstack/react-start/server-entry'

// oxlint-disable-next-line no-restricted-properties
if (process.env.DD_SERVICE !== undefined) {
  const { initTracer } = await import('@acme/logging/tracer')
  // oxlint-disable-next-line no-restricted-properties
  initTracer({ service: process.env.DD_SERVICE })
}

const fetch = createStartHandler(defaultStreamHandler)

export default createServerEntry({ fetch })
