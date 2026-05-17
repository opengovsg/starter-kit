import { getCookie, setCookie } from '@tanstack/react-start/server'

import { sealData, unsealData } from 'iron-session'

import { env } from '~/env'

export interface SessionData {
  userId?: string
  // Add other session data as needed
}

const SESSION_COOKIE_NAME = 'auth.session-token'
const SESSION_TTL = 60 * 60 * 24 * 7 // 7 days
// When you provide multiple passwords then all of them will be used to decrypt the cookie.
// But only the most recent (= highest key, e.g. 2) password will be used to encrypt the cookie.
// This allows password rotation.
const SESSION_PASSWORD = { '1': env.SESSION_SECRET } as const

type Session = SessionData & {
  save(): Promise<void>
  destroy(): void
}

export async function getSession(): Promise<Session> {
  const sealed = getCookie(SESSION_COOKIE_NAME)
  const data: SessionData = sealed
    ? await unsealData<SessionData>(sealed, {
        password: SESSION_PASSWORD,
        ttl: SESSION_TTL,
      })
    : {}

  const session: Session = Object.assign(data as Session, {
    save: async () => {
      const { save: _save, destroy: _destroy, ...sessionData } = session
      const newSealed = await sealData(sessionData, {
        password: SESSION_PASSWORD,
        ttl: SESSION_TTL,
      })
      setCookie(SESSION_COOKIE_NAME, newSealed, {
        httpOnly: true,
        secure: env.NODE_ENV !== 'development' && env.NODE_ENV !== 'test',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_TTL,
      })
    },
    destroy: () => {
      setCookie(SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        path: '/',
        maxAge: 0,
      })
    },
  })

  return session
}
