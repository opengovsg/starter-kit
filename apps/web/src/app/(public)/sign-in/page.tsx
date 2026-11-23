import { redirect } from 'next/navigation'

import { SignInPageComponent } from './_components/_page'

import { JavaScriptRequiredNotice } from '~/app/_components/javascript-required-notice'
import { AUTHED_ROOT_ROUTE } from '~/constants'
import { getSession } from '~/server/session'
import { readSessionState } from '~/server/session-state'

const SignInPage = async () => {
  const session = await getSession()

  if (readSessionState(session).kind === 'user') {
    redirect(AUTHED_ROOT_ROUTE)
  }

  return (
    <>
      <JavaScriptRequiredNotice />
      <SignInPageComponent />
    </>
  )
}

export default SignInPage
