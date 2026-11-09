import type { IronSession } from 'iron-session'

import { getUserById } from '~/server/modules/user/user.service'
import { type SessionData, isSessionAuthed } from '~/server/session'

/**
 * When the cookie carries a non-empty `userId`, ensure that user still exists.
 * Destroys stale sessions (missing DB user) and returns null so callers can
 * treat the browser as signed out.
 */
export const assertAuthedSessionUser = async (
  session: IronSession<SessionData>
): Promise<string | null> => {
  if (!isSessionAuthed(session)) {
    return null
  }

  const userId = session.userId as string
  const user = await getUserById(userId)

  if (!user) {
    await session.destroy()
    return null
  }

  return userId
}
