import { createTRPCRouter } from '../../trpc'
import { emailAuthRouter } from './auth.email.router'

export const authRouter = createTRPCRouter({
  email: emailAuthRouter,
})
