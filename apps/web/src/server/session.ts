import { cookies } from 'next/headers'

import { getIronSession } from 'iron-session'

import type { SessionData } from './session-options'
import { sessionOptions } from './session-options'

export const getSession = async () => {
  const cookieStore = await cookies()

  return await getIronSession<SessionData>(cookieStore, sessionOptions)
}
