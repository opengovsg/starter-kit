import type { SessionData } from './session-options'

/**
 * True when the cookie has a non-empty user id.
 * An empty string is anonymous, same as a missing id.
 */
export const isSessionAuthed = (
  session: SessionData
): session is SessionData & { userId: string } =>
  session.userId !== undefined && session.userId !== ''
