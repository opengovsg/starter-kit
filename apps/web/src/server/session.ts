import type { SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'

import { env } from '~/env'

export interface SessionData {
  userId?: string
  // Add other session data as needed
}

export const sessionOptions: SessionOptions = {
  password: {
    '1': env.SESSION_SECRET,
    // When you provide multiple passwords then all of them will be used to decrypt the cookie.
    // But only the most recent (= highest key, e.g. 2) password will be used to encrypt the cookie.
    // This allows password rotation.
  },
  cookieName: 'auth.session-token',
  ttl: 60 * 60 * 24 * 7, // 7 days
  cookieOptions: {
    secure: env.NODE_ENV !== 'development' && env.NODE_ENV !== 'test',
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}
