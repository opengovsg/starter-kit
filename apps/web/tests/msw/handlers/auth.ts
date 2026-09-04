import { delay } from 'msw'

import { trpcMsw } from '../trpc-msw'

export const authHandlers = {
  signIn: {
    loading: () =>
      trpcMsw.auth.email.login.mutation(async () => {
        await delay('infinite')
        return {
          email: 'never',
          otpPrefix: 'TST',
        }
      }),
    success: () =>
      trpcMsw.auth.email.login.mutation(() => ({
        email: 'test@example.com',
        otpPrefix: 'TST',
      })),
  },
}
