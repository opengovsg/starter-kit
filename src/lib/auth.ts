import { env } from '~/server/env'
import { IronSessionOptions } from 'iron-session'

export const sessionOptions: IronSessionOptions = {
  password: {
    '1': env.SESSION_SECRET,
  },
  cookieName: 'auth.session-token',
  ttl: 60 * 60 * 24 * 7, // 7 days
}
