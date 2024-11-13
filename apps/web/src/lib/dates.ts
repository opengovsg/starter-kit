import { format } from 'date-fns/format'

export const formatRelativeTime = (
  date?: Date | null,
  baseDate?: Date | null,
  formatStr = 'MMM dd',
) => {
  if (date === null || date === undefined) return

  if (!baseDate) {
    baseDate = new Date()
  }

  let deltaSeconds = (date.getTime() - baseDate.getTime()) / 1000
  const isFuture = deltaSeconds > 0 ? true : false

  let t
  deltaSeconds = Math.abs(deltaSeconds)

  if (deltaSeconds < 60) {
    t = `${Math.floor(deltaSeconds)}s`
  } else if (deltaSeconds < 3600) {
    t = `${Math.floor(deltaSeconds / 60)}m`
  } else if (deltaSeconds < 86400) {
    t = `${Math.floor(deltaSeconds / 3600)}h`
  } else {
    t = format(date, formatStr)
  }
  if (isFuture) {
    return 'in ' + t
  } else {
    return t
  }
}
