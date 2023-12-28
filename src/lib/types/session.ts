import { type User } from '@prisma/client'
import { type IronSession } from 'iron-session'
import { type SgidUserInfo } from '~/server/modules/auth/sgid/sgid.utils'

export type SessionData = {
  userId?: User['id']
  sgid?: {
    sessionState?: {
      codeVerifier: string
      nonce?: string
    }
    profiles?: {
      list: SgidUserInfo['data']['pocdex.public_officer_details']
      expiry: number
    }
  }
}

export type Session = IronSession<SessionData>
