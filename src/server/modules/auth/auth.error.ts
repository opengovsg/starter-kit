type ErrorCause = Record<string, unknown>

class AuthError extends Error {
  constructor(message: string | Error | ErrorCause, cause?: ErrorCause) {
    if (message instanceof Error) {
      super(undefined, {
        cause: { err: message, ...(message.cause as any), ...cause },
      })
    } else if (typeof message === 'string') {
      if (cause instanceof Error) {
        cause = { err: cause, ...(cause.cause as any) }
      }
      super(message, cause)
    } else {
      super(undefined, message)
    }
    Error.captureStackTrace?.(this, this.constructor)
    this.name =
      message instanceof AuthError ? message.name : this.constructor.name
  }
}

/**
 * The user's email/token combination was invalid.
 * This could be because the email/token combination was not found in the database,
 * or because it token has expired. Ask the user to log in again.
 */
export class VerificationError extends AuthError {}
