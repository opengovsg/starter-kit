import { type User } from '@prisma/client'
import { type IronSession } from 'iron-session'
import { type defaultMeSelect } from '~/server/modules/me/me.select'

export type SessionData = {
  user?: Pick<User, keyof typeof defaultMeSelect>
  sgidSessionState?: {
    codeVerifier: string
    nonce?: string
  }
}

export type Session = IronSession<SessionData>
