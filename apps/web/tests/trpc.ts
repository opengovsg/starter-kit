import type { IronSession } from 'iron-session'
import { vi } from 'vitest'

import { createBaseLogger } from '@acme/logging'

import { appRouter } from '~/server/api/root'
import { createCallerFactory } from '~/server/api/trpc'
import type { SessionData } from '~/server/session'

const testLogger = createBaseLogger({
  clientIp: null,
  path: 'tests',
  userAgent: null,
})

/**
 * Creates a mock session object for testing purposes.
 * This avoids the need to call Next.js cookies() which requires a request context.
 */
const createMockSession = (
  sessionData?: SessionData
): IronSession<SessionData> => ({
  ...sessionData,
  destroy: vi.fn<() => void>(),
  save: vi.fn<() => Promise<void>>(),
  updateConfig: vi.fn<() => void>(),
})

/**
 * Creates a test context for tRPC callers.
 * This is a simplified version of createTRPCContext that doesn't require Next.js request context.
 *
 * Add more properties to the context as needed for testing.
 */
export const createTestContext = ({
  session,
}: { session?: SessionData } = {}) => ({
  headers: new Headers(),
  logger: testLogger,
  resHeaders: new Headers(),
  session: createMockSession(session),
})

/**
 * Create a test caller for tRPC procedures.
 */
export const createTestCaller = createCallerFactory(appRouter)
