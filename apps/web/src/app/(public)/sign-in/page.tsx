import { redirect } from 'next/navigation'

import { SignInPageComponent } from './_components/_page'

import { AUTHED_ROOT_ROUTE } from '~/constants'
import { getSession } from '~/server/session'

const SignInPage = async () => {
  const session = await getSession()

  if (session.userId !== undefined && session.userId !== '') {
    redirect(AUTHED_ROOT_ROUTE)
  }

  return <SignInPageComponent />
}

export default SignInPage
