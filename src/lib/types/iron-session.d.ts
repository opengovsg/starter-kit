import { type User } from '@prisma/client'
import { type defaultMeSelect } from '~/server/modules/me/me.select'

declare module 'iron-session' {
  interface IronSessionData {
    user?: Pick<User, keyof typeof defaultMeSelect>
    sgidSessionState?: {
      codeVerifier: string
      nonce?: string
    }
  }
}
