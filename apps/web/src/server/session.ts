import { cookies } from 'next/headers'

import type { SessionOptions } from 'iron-session'
import { getIronSession } from 'iron-session'

import { env } from '~/env'

export interface SessionData {
  userId?: string
  // Opaque per-login id, surfaced as correlation_id in logs. Set on every
  // successful `auth.email.verifyOtp` login; omit only on legacy cookies.
  sessionId?: string
  // Add other session data as needed
}

/** Match iron-session auth gates in layouts and tRPC `authMiddleware`. */
export const isSessionAuthed = (session: SessionData): boolean =>
  session.userId !== undefined && session.userId !== ''

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
  // 7 days
  ttl: 60 * 60 * 24 * 7,
}

export const getSession = async () => {
  const cookieStore = await cookies()

  return await getIronSession<SessionData>(cookieStore, sessionOptions)
}
