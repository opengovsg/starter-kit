import { createFileRoute } from '@tanstack/react-router'

import { LandingPageComponent } from '~/app/(public)/_components/landing-page/_page'
import { env } from '~/env'
import { getSession } from '~/server/session'

export const Route = createFileRoute('/_public/')({
  loader: async () => {
    // Might not be worth the session lookup on this public page. Remove this logic
    // if you want to skip the auth check and always show the logged-out landing page.
    const session = await getSession()
    return { isAuthed: session.userId !== undefined }
  },
  component: LandingPage,
})

function LandingPage() {
  const { isAuthed } = Route.useLoaderData()

  return (
    <LandingPageComponent appName={env.VITE_APP_NAME} isAuthed={isAuthed} />
  )
}
