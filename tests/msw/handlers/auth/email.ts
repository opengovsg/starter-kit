import { trpcMsw } from 'tests/msw/mockTrpc'
import { type VfnStepData } from '~/features/sign-in/components'

const emailLoginPostQuery = (vfnStepData: VfnStepData) => {
  return trpcMsw.auth.email.login.mutation((_req, res, ctx) => {
    return res(ctx.status(200), ctx.data(vfnStepData))
  })
}

export const authEmailHandlers = {
  login: emailLoginPostQuery,
}
