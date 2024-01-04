import { type User } from '@prisma/client'
import { type IronSession } from 'iron-session'
import { type SgidSessionProfile } from '~/server/modules/auth/sgid/sgid.utils'

export type SessionData = {
  userId?: User['id']
  sgid?: {
    sessionState?: {
      codeVerifier: string
      nonce?: string
    }
    profiles?: SgidSessionProfile
  }
}

export type Session = IronSession<SessionData>
