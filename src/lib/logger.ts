import { nanoid } from 'nanoid'
import winston, { format } from 'winston'
import { env } from '~/env.mjs'

const { combine, timestamp, prettyPrint, colorize } = format

type LoggerOptions = {
  path: string
  clientIp?: string
}

export const createBaseLogger = ({ path, clientIp }: LoggerOptions) => {
  const formats = [
    winston.format.json(),
    timestamp(),
    env.NODE_ENV === 'development' ? prettyPrint() : undefined,
    env.NODE_ENV === 'development' ? colorize() : undefined,
  ].filter((v) => !!v) as winston.Logform.Format[]

  return winston.createLogger({
    format: combine(...formats),
    exitOnError: false,
    transports: [
      new winston.transports.Console({
        silent: env.NODE_ENV === 'test',
      }),
    ],
    defaultMeta: {
      path,
      clientIp,
      id: nanoid(),
    },
  })
}
