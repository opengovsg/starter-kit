import type { IronSession } from 'iron-session'

import { createBaseLogger } from '@acme/logging'

import type { SessionData } from '~/server/session'
import { appRouter } from '~/server/api/root'
import { createCallerFactory } from '~/server/api/trpc'

const testLogger = createBaseLogger({
  path: 'tests',
})

/**
 * Creates a mock session object for testing purposes.
 * This avoids the need to call Next.js cookies() which requires a request context.
 */
const createMockSession = (
  sessionData?: SessionData,
): IronSession<SessionData> => ({
  ...sessionData,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  save: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  destroy: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updateConfig: () => {},
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
  session: createMockSession(session),
  resHeaders: new Headers(),
  logger: testLogger,
})

/**
 * Create a test caller for tRPC procedures.
 */
export const createTestCaller = createCallerFactory(appRouter)
