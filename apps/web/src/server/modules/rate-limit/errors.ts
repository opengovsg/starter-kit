import { TRPCError } from '@trpc/server'

export class TRPCRateLimitError extends TRPCError {
  retryAfterSeconds: number

  constructor({
    message,
    retryAfterSeconds,
  }: {
    message?: string
    retryAfterSeconds: number
  }) {
    super({
      code: 'TOO_MANY_REQUESTS',
      message:
        message ??
        `Rate limit exceeded. Please try again in ${retryAfterSeconds} seconds.`,
      cause: {
        retryAfterSeconds,
      },
    })
    this.retryAfterSeconds = retryAfterSeconds
  }
}
