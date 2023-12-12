import { type User } from '@prisma/client'
import { type IronSession } from 'iron-session'

export type SessionData = {
  userId?: User['id']
  sgidSessionState?: {
    codeVerifier: string
    nonce?: string
  }
}

export type Session = IronSession<SessionData>
