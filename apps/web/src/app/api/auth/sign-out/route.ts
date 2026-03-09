import { redirect } from 'next/navigation'

import { LOGIN_ROUTE } from '~/constants'
import { getSession } from '~/server/session'

export async function GET() {
  const session = await getSession()
  session.destroy()
  redirect(LOGIN_ROUTE)
}
