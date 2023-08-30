import { useRouter } from 'next/router'
import { type PropsWithChildren } from 'react'
import { CALLBACK_URL_KEY } from '~/constants/params'
import { useLoginState } from '~/features/auth'
import { HOME } from '~/lib/routes'
import { FullscreenSpinner } from '../FullscreenSpinner'

interface PublicPageWrapperProps {
  /**
   * If `strict` is true, only users without the login flag in localStorage can access the route.
   * i.e. signin page, where authed users accessing that page should be
   * redirected out.
   * If `strict` is false, then both authed and non-authed users can access
   * the route.
   * Defaults to `false`.
   */
  strict?: boolean
}

/**
 * Page wrapper that renders children only if the login cookie is NOT found.
 * Otherwise, will redirect to the route passed into the `CALLBACK_URL_KEY` URL parameter.
 *
 * @note There is no authentication being performed by this component. This component is merely a wrapper that checks for the presence of the login flag in localStorage.
 */
export const PublicPageWrapper = ({
  strict,
  children,
}: PropsWithChildren<PublicPageWrapperProps>): JSX.Element => {
  const router = useRouter()
  const { hasLoginStateFlag } = useLoginState()

  const callbackUrl = String(router.query[CALLBACK_URL_KEY] ?? HOME)

  if (hasLoginStateFlag && strict) {
    void router.replace(callbackUrl)
    return <FullscreenSpinner />
  }

  return <>{children}</>
}
