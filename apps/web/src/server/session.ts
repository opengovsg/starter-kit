import { createServerFn } from '@tanstack/react-start'

import type { SessionData } from './session.server'

export type { SessionData }

// Route files (beforeLoad / loader) use this. It runs on the server and is
// called via RPC when triggered from the client during client-side navigation.
// Returns plain SessionData (no save/destroy methods) because those are not
// JSON-serialisable. Server-only code (API routes, tRPC) should import
// getSession directly from ./session.server instead.
export const getSession = createServerFn().handler(
  async (): Promise<SessionData> => {
    const { getSession: getSessionServer } = await import('./session.server')
    const { save: _save, destroy: _destroy, ...data } = await getSessionServer()
    return data
  },
)
