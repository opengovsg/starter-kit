import { trpcMsw } from 'tests/msw/mockTrpc'

import { type VfnStepData } from '~/features/sign-in/components'

const emailLoginPostQuery = (vfnStepData: VfnStepData) => {
  return trpcMsw.auth.email.login.mutation(() => {
    return vfnStepData
  })
}

export const authEmailHandlers = {
  login: emailLoginPostQuery,
}
