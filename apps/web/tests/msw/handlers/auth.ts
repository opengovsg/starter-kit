import { delay } from 'msw'

import { trpcMsw } from '../trpc-msw'

export const authHandlers = {
  signIn: {
    success: () =>
      trpcMsw.auth.email.login.mutation(() => {
        return {
          email: 'test@example.com',
          otpPrefix: 'TST',
        }
      }),
    loading: () =>
      trpcMsw.auth.email.login.mutation(async () => {
        await delay('infinite')
        return {
          email: 'never',
          otpPrefix: 'TST',
        }
      }),
  },
}
