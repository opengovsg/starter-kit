import type { SessionOptions } from 'iron-session'

import { env } from '~/env'

export interface SessionData {
  userId?: string
  sessionId?: string
}

export const sessionOptions: SessionOptions = {
  cookieName: 'auth.session-token',
  cookieOptions: {
    secure: env.NODE_ENV !== 'development' && env.NODE_ENV !== 'test',
  },
  password: {
    '1': env.SESSION_SECRET,
    // When you provide multiple passwords then all of them will be used to decrypt the cookie.
    // But only the most recent (= highest key, e.g. 2) password will be used to encrypt the cookie.
    // This allows password rotation.
  },
  ttl: 60 * 60 * 24 * 7,
}
