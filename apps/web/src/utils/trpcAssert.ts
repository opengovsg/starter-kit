import { TRPCError } from '@trpc/server'
import { type TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'
import { type Logger } from 'pino'

/**
 * This function is used to assert that a condition is true.
 * If the condition is false, the specified TRPCError is thrown.
 */
export function trpcAssert<T>(
  condition: T extends Promise<unknown> ? never : T,
  opts: {
    message: string
    code: TRPC_ERROR_CODE_KEY
  } & (
    | {
        context?: Record<string, unknown>
        logger: Logger<string>
      }
    | { context?: never; logger?: never }
  ),
): asserts condition {
  if (!condition) {
    if (opts.logger) {
      opts.logger.error({ code: opts.code, ...opts.context }, opts.message)
    }
    throw new TRPCError({
      code: opts.code,
      message: opts.message,
    })
  }
}
