import { useEffect, useState, type PropsWithChildren } from 'react'
import { useRouter } from 'next/router'

import { getRedirectUrl } from '~/utils/url'
import { useLoginState } from '~/features/auth'
import { callbackUrlSchema } from '~/schemas/url'
import { FullscreenSpinner } from '../FullscreenSpinner'
import { type CallbackRoute } from '~/lib/routes'

type PublicPageWrapperProps =
  | { strict: true; redirectUrl?: CallbackRoute }
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

  const [isRedirecting, setIsRedirecting] = useState(true)

  useEffect(() => {
    if (hasLoginStateFlag && rest.strict) {
      if (rest.redirectUrl) {
        // must validate redirectUrl param
        void router.replace(callbackUrlSchema.parse(rest.redirectUrl))
      } else {
        void router.replace(getRedirectUrl(router.query))
      }
    } else {
      setIsRedirecting(false)
    }
  }, [hasLoginStateFlag, rest, router])

  if (isRedirecting) {
    return <FullscreenSpinner />
  }

  return <>{children}</>
}
