import winston, { format } from 'winston'

const { combine, timestamp, prettyPrint } = format

export const createBaseLogger = (path: string) => {
  const formats = [
    winston.format.json(),
    timestamp(),
    process.env.NODE_ENV === 'development' ? prettyPrint() : undefined,
  ].filter((v) => !!v) as winston.Logform.Format[]

  return winston.createLogger({
    format: combine(...formats),
    transports: [new winston.transports.Console()],
    defaultMeta: {
      path,
    },
  })
}
