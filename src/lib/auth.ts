import { type IronSessionOptions } from 'iron-session'
import { env } from '~/env.mjs'

export const sessionOptions: IronSessionOptions = {
  password: {
    '1': env.SESSION_SECRET,
  },
  cookieName: 'auth.session-token',
  ttl: 60 * 60 * 24 * 7, // 7 days
}
