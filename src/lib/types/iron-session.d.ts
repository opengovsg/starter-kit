import { type User } from '@prisma/client'
import { type defaultUserSelect } from '~/server/modules/user/user.select'

declare module 'iron-session' {
  interface IronSessionData {
    user?: Pick<User, keyof typeof defaultUserSelect>
    sgidSessionState?: {
      codeVerifier: string
      nonce?: string
    }
  }
}
