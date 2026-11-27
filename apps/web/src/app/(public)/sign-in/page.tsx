import { redirect } from 'next/navigation'

import { SignInPageComponent } from './_components/_page'

import { JavaScriptRequiredNotice } from '~/app/_components/javascript-required-notice'
import { AUTHED_ROOT_ROUTE } from '~/constants'
import { getSession, isSessionAuthed } from '~/server/session'

const SignInPage = async () => {
  const session = await getSession()

  if (isSessionAuthed(session)) {
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
