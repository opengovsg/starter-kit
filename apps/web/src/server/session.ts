import { cookies } from 'next/headers'

import type { SessionOptions } from 'iron-session'
import { getIronSession } from 'iron-session'

import { env } from '~/env'

export interface SessionData {
  userId?: string
  // Opaque per-login id, surfaced as correlation_id in logs and required by
  // the audit.authn.* events to group a session's activity.
  sessionId?: string
  // Add other session data as needed
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
  // 7 days
  ttl: 60 * 60 * 24 * 7,
}

export const getSession = async () => {
  const cookieStore = await cookies()
  return await getIronSession<SessionData>(cookieStore, sessionOptions)
}
