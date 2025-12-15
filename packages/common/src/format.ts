import { TZDate } from '@date-fns/tz'
import { format } from 'date-fns'

export const TWELVE_HR_FMT = 'dd MMM yyyy h:mm a'

export const fmtDateTime = (date: Date, fmt = TWELVE_HR_FMT) => {
  return format(new TZDate(date, 'Asia/Singapore'), fmt)
}
