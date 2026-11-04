import type { SessionOptions } from 'iron-session'

import { env } from '~/env'

// Kept apart from session.ts (which imports next/headers) so code running
// outside Next, like the e2e globalSetup, can seal session cookies.
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
