import { User } from '@prisma/client'
import { defaultMeSelect } from '~/server/modules/me/me.select'

declare module 'iron-session' {
  interface IronSessionData {
    user?: Pick<User, keyof typeof defaultMeSelect>
  }
}
