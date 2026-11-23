import { cookies } from 'next/headers'

import { getIronSession } from 'iron-session'

import type { SessionData } from './session-options'
import { sessionOptions } from './session-options'

export const getSession = async () => {
  const cookieStore = await cookies()

  return await getIronSession<SessionData>(cookieStore, sessionOptions)
}

/**
 * True when the cookie has a non-empty user id.
 * An empty string is anonymous, same as a missing id.
 */
export const isSessionAuthed = (
  session: SessionData
): session is SessionData & { userId: string } =>
  session.userId !== undefined && session.userId !== ''
