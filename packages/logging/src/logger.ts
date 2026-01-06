import type { DestinationStream } from 'pino'
import { destination, pino } from 'pino'
import { PinoPretty } from 'pino-pretty'

import type { BasicLogger, LogInput } from './types'
import { env } from './env'

export class PinoLogger {
  private static instance: ReturnType<typeof this.createBaseLogger>
  private static getInstance() {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    PinoLogger.instance ??= PinoLogger.createBaseLogger()
    return PinoLogger.instance
  }
  private static createBaseLogger = () => {
    let transport: ReturnType<typeof destination> | DestinationStream
    if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
      transport = PinoPretty({
        colorize: true,
        hideObject: false,
        messageKey: 'message',
        timestampKey: 'timestamp',
        messageFormat: '[{path}] {message}',
      })
    } else {
      transport = destination(1)
    }
    return pino(
      {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        level: env.NODE_ENV === 'test' ? 'silent' : (env.LOG_LEVEL ?? 'info'),
        useOnlyCustomLevels: true,
        customLevels: {
          fatal: 80,
          alert: 70,
          critical: 60,
          error: 50,
          warn: 40,
          notice: 30,
          info: 20,
          debug: 10,
        },
        timestamp: () => `,"timestamp":"${Date.now()}"`,
        formatters: {
          bindings: (bindings) => {
            return {
              env: env.NEXT_PUBLIC_ENVIRONMENT,
              version: env.NEXT_PUBLIC_APP_VERSION,
              ...bindings,
            }
          },
          level: (label) => {
            return { level: label.toUpperCase() }
          },
        },
        errorKey: 'error',
        messageKey: 'message',
      },
      transport,
    )
  }
  /*
    The logger we use inherits the bindings and transport from the parent singleton instance
    Use child loggers to avoid creating a new instance for every tRPC call
  */
  public static logger = ({
    source,
    path,
    traceId,
    userId,
    deviceId,
    userAgent,
    correlationId,
    cfConnectingIp,
    clientVersion,
    serverVersion,
  }: {
    source?: string
    path: string
    traceId?: string
    userId?: string
    deviceId?: string
    correlationId?: string
    cfConnectingIp?: string
    userAgent?: string
    clientVersion?: string
    serverVersion?: string
  }) => {
    return PinoLogger.getInstance().child({
      path,
      trace_id: traceId,
      user_id: userId,
      device_id: deviceId,
      correlation_id: correlationId,
      cf_connecting_ip: cfConnectingIp,
      user_agent: userAgent,
      client_version: clientVersion,
      server_version: serverVersion,
      source,
      in_latest_version: clientVersion === serverVersion,
    })
  }
}

export type ScopedLogInput = Omit<LogInput, 'action'> & { action?: string }
export interface LoggerInterface<T extends ScopedLogInput = LogInput> {
  createScopedLogger(options: {
    action: string | [string, ...string[]]
    context?: LogInput['context']
  }): LoggerInterface<ScopedLogInput>
  debug(input: Omit<T, 'error'>): void
  info(input: Omit<T, 'error'>): void
  notice(input: T): void
  warn(input: T): void
  error(input: T): void
  alert(input: T): void
  critical(input: T): void
}

export class CustomLogger<T extends ScopedLogInput = LogInput>
  implements LoggerInterface<T>
{
  private logger: ReturnType<typeof PinoLogger.logger>
  private context: NonNullable<LogInput['context']> | null
  private action: string[] | null

  static getInstance({
    source,
    path,
    traceId,
    userId,
    correlationId,
    cfConnectingIp,
    userAgent,
    deviceId,
    serverVersion,
    clientVersion,
  }: {
    source?: string
    path: string
    traceId?: string
    userId?: string
    correlationId?: string
    cfConnectingIp?: string
    userAgent?: string
    deviceId?: string
    serverVersion?: string
    clientVersion?: string
  }) {
    const logger = PinoLogger.logger({
      source,
      path,
      traceId,
      userId,
      correlationId,
      cfConnectingIp,
      deviceId,
      userAgent,
      clientVersion,
      serverVersion,
    })
    return new CustomLogger(logger)
  }

  constructor(
    logger: ReturnType<typeof PinoLogger.logger>,
    options?: {
      action: string[]
      context?: LogInput['context']
    },
  ) {
    this.logger = logger
    if (options) {
      this.action = [...options.action]
      this.context = { ...options.context }
    } else {
      this.action = null
      this.context = null
    }
  }

  createScopedLogger(options: {
    action: string | [string, ...string[]]
    context?: LogInput['context']
  }): LoggerInterface<ScopedLogInput> {
    const context = { ...this.context, ...options.context }
    const action = [...(this.action ?? [])].concat(
      typeof options.action === 'string' ? [options.action] : options.action,
    )

    return new CustomLogger<ScopedLogInput>(this.logger, { action, context })
  }

  debug(input: Omit<T, 'error'>) {
    return this.formatLog('debug', input)
  }
  info(input: Omit<T, 'error'>) {
    return this.formatLog('info', input)
  }
  notice(input: T) {
    return this.formatLogWithErrors('notice', input)
  }
  warn(input: T) {
    return this.formatLogWithErrors('warn', input)
  }
  error(input: T) {
    return this.formatLogWithErrors('error', input)
  }
  alert(input: T) {
    return this.formatLogWithErrors('alert', input)
  }
  critical(input: T) {
    return this.formatLogWithErrors('critical', input)
  }

  private formatLog(level: 'debug' | 'info', input: ScopedLogInput) {
    const { message, context, merged, ...rest } = this.formatInput(input)
    return this.logger[level]({ context, ...merged, ...rest }, message)
  }

  private formatLogWithErrors(
    level: 'notice' | 'warn' | 'error' | 'alert' | 'critical' | 'fatal',
    input: ScopedLogInput,
  ) {
    const { message, context, error, merged, ...rest } = this.formatInput(input)

    if (error instanceof Error) {
      return this.logger[level](
        {
          ...rest,
          ...merged,
          context,
          error: { ...error, stack: error.stack, cause: error.cause },
        },
        message,
      )
    }

    return this.logger[level]({ context, ...merged, ...rest }, message)
  }

  private formatInput(input: ScopedLogInput): LogInput {
    const history = input.action
      ? (this.action ?? undefined)
      : (this.action?.slice(0, -1) ?? undefined)
    const action = input.action ?? this.action?.at(-1) ?? ''

    let ctx =
      !!this.context || !!input.context
        ? { ...this.context, ...input.context }
        : undefined

    try {
      // Stringify returns undefined if ctx is `undefined`.
      const stringified = JSON.stringify(ctx) as string | undefined

      // If size greater than 200kB, remove the context to make sure
      // that the log line is still written

      // Based on empirical testing, a log line exceeding 262118 characters
      // results in it being broken into multiple lines, leading to malformed JSON.
      // To account for extra values such as the message, action, history, ECS metadata etc.
      // We limit the context to 200,000 characters.

      if (stringified && stringified.length > 2e5) {
        ctx = { logger: '[Context removed]' }
        this.logger.warn(
          {
            action,
            history,
            context: {
              size: stringified.length,
            },
          },
          'Log context is too large',
        )
        for (let i = 0; i < stringified.length; i += 2e5) {
          this.logger.warn(
            {
              action,
              history,
              context: {
                chunk: Math.floor(i / 2e5) + 1,
                chunks: Math.floor(stringified.length / 2e5) + 1,
                data: stringified.slice(
                  i,
                  Math.min(stringified.length, i + 2e5),
                ),
              },
            },
            `Removed context`,
          )
        }
      }
    } catch {
      ctx = { logger: '[Context removed]' }
      this.logger.error(
        {
          action,
          history,
        },
        'Failed to parse log context',
      )
    }

    return {
      ...input,
      action,
      history,
      context: ctx,
    }
  }
}

export const createBaseLogger = (options: {
  path: string
  source?: string
  traceId?: string
  userId?: string
  deviceId?: string
  cfConnectingIp?: string
  userAgent?: string
  correlationId?: string
  clientVersion?: string
  serverVersion?: string
}): CustomLogger => {
  return CustomLogger.getInstance(options)
}

export type Logger = BasicLogger & LoggerInterface
export type ScopedLogger = LoggerInterface<ScopedLogInput>
