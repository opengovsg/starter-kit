import { redirect } from 'next/navigation'

import { getSession } from '~/server/session'
import { SignInPageComponent } from './_components/_page'

export default async function SignInPage() {
  const session = await getSession()

  if (session.userId) {
    redirect('/admin')
  }

  return <SignInPageComponent />
}
