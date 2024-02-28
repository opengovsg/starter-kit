import { useRouter } from 'next/router'
import { type PropsWithChildren } from 'react'
import { CALLBACK_URL_KEY } from '~/constants/params'
import { useLoginState } from '~/features/auth'
import { callbackUrlSchema } from '~/schemas/url'
import { FullscreenSpinner } from '../FullscreenSpinner'

type PublicPageWrapperProps =
  | { strict: true; redirectUrl?: string }
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
    if (rest.redirectUrl) {
      void router.replace(callbackUrlSchema.parse(rest.redirectUrl))
    } else {
      void router.replace(
        callbackUrlSchema.parse(router.query[CALLBACK_URL_KEY]),
      )
    }
    return <FullscreenSpinner />
  }

  return <>{children}</>
}
