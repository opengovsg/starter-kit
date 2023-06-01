import { utcToZonedTime } from 'date-fns-tz'

export const getCurrSgtTime = () => {
  const now = new Date()

  return utcToZonedTime(now, 'Asia/Singapore')
}
