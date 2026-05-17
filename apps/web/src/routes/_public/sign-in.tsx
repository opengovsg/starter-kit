import { createFileRoute, redirect } from '@tanstack/react-router'

import { SignInPageComponent } from '~/app/(public)/sign-in/_components/_page'
import { AUTHED_ROOT_ROUTE } from '~/constants'
import { getSession } from '~/server/session'

export const Route = createFileRoute('/_public/sign-in')({
  beforeLoad: async () => {
    const session = await getSession()
    if (session.userId) {
      throw redirect({ to: AUTHED_ROOT_ROUTE })
    }
  },
  component: SignInPage,
})

function SignInPage() {
  return <SignInPageComponent />
}
