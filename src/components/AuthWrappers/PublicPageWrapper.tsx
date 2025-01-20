import { type PropsWithChildren } from 'react'
import { useRouter } from 'next/router'

import { getRedirectRoute, resolveRouteKey } from '~/utils/url'
import { useLoginState } from '~/features/auth'
import { type ALL_ROUTES } from '~/lib/routes'
import { FullscreenSpinner } from '../FullscreenSpinner'

type PublicPageWrapperProps =
  | { strict: true; redirectRouteKey?: keyof typeof ALL_ROUTES }
  | { strict: false }

/**
 * Page wrapper that renders children only if the login cookie is NOT found.
 * Otherwise, will redirect to the route passed into the `CALLBACK_URL_KEY` URL parameter.
 *
 * @note There is no authentication being performed by this component. This component is merely a wrapper that checks for the presence of the login flag in localStorage.
 */
export const PublicPageWrapper = ({
  children,
  ...rest
}: PropsWithChildren<PublicPageWrapperProps>): JSX.Element => {
  const router = useRouter()
  const { hasLoginStateFlag } = useLoginState()

  if (hasLoginStateFlag && rest.strict) {
    if (rest.redirectRouteKey) {
      void router.replace(resolveRouteKey(rest.redirectRouteKey))
    } else {
      void router.replace(getRedirectRoute(router.query))
    }
    return <FullscreenSpinner />
  }

  return <>{children}</>
}
