import { useRouter } from 'next/router'
import { type PropsWithChildren } from 'react'
import { CALLBACK_URL_KEY } from '~/constants/params'
import { useLoginState } from '~/features/auth'
import { HOME } from '~/lib/routes'
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
    const callbackUrl =
      rest.redirectUrl ?? String(router.query[CALLBACK_URL_KEY] ?? HOME)
    void router.replace(callbackUrl)
    return <FullscreenSpinner />
  }

  return <>{children}</>
}
