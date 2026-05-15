import { CustomLogger } from '../logger'

const makeMockLogger = () => ({
  notice: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  alert: vi.fn(),
  critical: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  fatal: vi.fn(),
})

describe('CustomLogger', () => {
  describe('formatLogWithErrors', () => {
    it.each(['notice', 'warn', 'error', 'alert', 'critical'] as const)(
      'preserves error.message and error.name on %s',
      (level) => {
        const mock = makeMockLogger()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const logger = new CustomLogger(mock as any)
        const err = new Error('boom')

        logger[level]({
          message: 'something failed',
          action: 'test',
          error: err,
        })

        expect(mock[level]).toHaveBeenCalledTimes(1)
        const [payload, message] = mock[level].mock.calls[0] as [
          { error: { message: string; name: string; stack?: string } },
          string,
        ]
        expect(message).toBe('something failed')
        expect(payload.error.message).toBe('boom')
        expect(payload.error.name).toBe('Error')
        expect(payload.error.stack).toBeDefined()
      }
    )

    it('preserves custom enumerable props and cause on Error subclasses', () => {
      class HttpError extends Error {
        status: number
        constructor(message: string, status: number, options?: ErrorOptions) {
          super(message, options)
          this.name = 'HttpError'
          this.status = status
        }
      }

      const mock = makeMockLogger()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const logger = new CustomLogger(mock as any)
      const cause = new Error('upstream timeout')
      const err = new HttpError('bad gateway', 502, { cause })

      logger.error({ message: 'req failed', action: 'test', error: err })

      const [payload] = mock.error.mock.calls[0] as [
        {
          error: {
            message: string
            name: string
            status: number
            cause: unknown
          }
        },
      ]
      expect(payload.error.message).toBe('bad gateway')
      expect(payload.error.name).toBe('HttpError')
      expect(payload.error.status).toBe(502)
      expect(payload.error.cause).toBe(cause)
    })
  })
})
