import { useRouter } from 'next/router'
import { type PropsWithChildren } from 'react'
import { CALLBACK_URL_KEY } from '~/constants/params'
import { useAuth } from '~/features/auth'
import { HOME } from '~/lib/routes'
import { FullscreenSpinner } from '../FullscreenSpinner'

interface PublicPageWrapperProps {
  /**
   * If `strict` is true, only non-authed users can access the route.
   * i.e. signin page, where authed users accessing that page should be
   * redirected out.
   * If `strict` is false, then both authed and non-authed users can access
   * the route.
   * Defaults to `false`.
   */
  strict?: boolean
}

export const PublicPageWrapper = ({
  strict,
  children,
}: PropsWithChildren<PublicPageWrapperProps>): JSX.Element => {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const callbackUrl = String(router.query[CALLBACK_URL_KEY] ?? HOME)

  if (isAuthenticated && strict) {
    void router.replace(callbackUrl)
    return <FullscreenSpinner />
  }

  return <>{children}</>
}
