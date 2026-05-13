import { redirect } from 'next/navigation'

import { SignInPageComponent } from './_components/_page'

import { AUTHED_ROOT_ROUTE } from '~/constants'
import { getSession } from '~/server/session'

export default async function SignInPage() {
  const session = await getSession()

  if (session.userId) {
    redirect(AUTHED_ROOT_ROUTE)
  }

  return <SignInPageComponent />
}
