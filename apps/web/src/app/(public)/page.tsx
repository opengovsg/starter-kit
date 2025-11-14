import { env } from '~/env'
import { getSession } from '~/server/session'
import { LandingPageComponent } from './_components/landing-page/_page'

export default async function LandingPage() {
  // Might not be worth subscribing this page to be dynamically rendered just to
  // check for authentication. Remove this logic if you want to keep this as a static
  // page.
  const session = await getSession()
  const isAuthed = session.userId !== undefined

  return (
    <LandingPageComponent
      appName={env.NEXT_PUBLIC_APP_NAME}
      isAuthed={isAuthed}
    />
  )
}
