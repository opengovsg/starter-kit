import { useEffect, type PropsWithChildren } from 'react'
import { useRouter } from 'next/router'

import { appendWithRedirect } from '~/utils/url'
import { useLoginState } from '~/features/auth'
import { HOME, SIGN_IN, type CallbackRoute } from '~/lib/routes'
import { FullscreenSpinner } from '../FullscreenSpinner'

interface EnforceLoginStatePageWrapperProps {
  /**
   * Route to redirect to after user is authenticated. Defaults to
   * `HOME` route if not provided.
   */
  redirectTo?: CallbackRoute
}

const Redirect = ({ redirectTo = HOME }: EnforceLoginStatePageWrapperProps) => {
  const router = useRouter()

  useEffect(() => {
    void router.replace(appendWithRedirect(SIGN_IN, redirectTo))
  }, [router, redirectTo])

  return <FullscreenSpinner />
}

/**
 * Page wrapper that renders children only if the login state localStorage flag has been set.
 * Otherwise, will redirect to SIGN_IN, which will redirect to route passed into the `redirectTo` prop.
 *
 * @note 🚨 There is no authentication being performed by this component. This component is merely a wrapper that checks for the presence of the login flag in localStorage. This means that a user could add the flag and bypass the check. Any page children that require authentication should also perform authentication checks in that page itself!
 */
export const EnforceLoginStatePageWrapper = ({
  redirectTo = HOME,
  children,
}: PropsWithChildren<EnforceLoginStatePageWrapperProps>): React.ReactElement => {
  const { hasLoginStateFlag } = useLoginState()

  if (hasLoginStateFlag) {
    return <>{children}</>
  }

  return <Redirect redirectTo={redirectTo} />
}
