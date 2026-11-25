import { authMiddleware } from './middleware/auth'
import { loggerMiddleware } from './middleware/logger'
import { rateLimitMiddleware } from './middleware/rate-limit'
import { tracingMiddleware } from './tracing'
import { t } from './trpc-init'

export {
  createCallerFactory,
  createTRPCContext,
  createTRPCRouter,
} from './trpc-init'

const defaultProcedure = t.procedure
  .use(tracingMiddleware)
  .use(loggerMiddleware)
  .use(rateLimitMiddleware)

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = defaultProcedure

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = defaultProcedure.use(authMiddleware)
