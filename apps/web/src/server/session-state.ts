import type { SessionData } from './session-options'

/**
 * Signed-in session. `userId` is a non-empty user id. An empty cookie value
 * is not representable here.
 */
export interface UserSession {
  kind: 'user'
  userId: string
  sessionId?: string
}

/** No usable user id in the cookie. */
export interface AnonymousSession {
  kind: 'anon'
}

/** Read model for an iron-session cookie. */
export type SessionState = UserSession | AnonymousSession

const present = (value: string | undefined): string | undefined =>
  value === undefined || value === '' ? undefined : value

/**
 * Turns the cookie shape into a session the rest of the app can switch on.
 * `userId: ''` is anonymous, same as a missing id.
 */
export const readSessionState = (session: SessionData): SessionState => {
  const userId = present(session.userId)

  if (userId === undefined) {
    return { kind: 'anon' }
  }

  const sessionId = present(session.sessionId)

  if (sessionId === undefined) {
    return { kind: 'user', userId }
  }

  return { kind: 'user', sessionId, userId }
}
