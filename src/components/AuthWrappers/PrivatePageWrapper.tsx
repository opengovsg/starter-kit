import { useRouter } from 'next/router'
import { useMemo, type PropsWithChildren } from 'react'
import { CALLBACK_URL_KEY } from '~/constants/params'
import { useAuth } from '~/features/auth'
import { SIGN_IN } from '~/lib/routes'
import { FullscreenSpinner } from '../FullscreenSpinner'

interface PrivatePageWrapperProps {
  /**
   * Route to redirect to when user is not authenticated. Defaults to
   * `SIGN_IN` route if not provided.
   */
  redirectTo?: string
}

const Redirect = ({ redirectTo }: PrivatePageWrapperProps) => {
  const router = useRouter()
  const redirectUrl = useMemo(() => {
    if (typeof window === 'undefined') return encodeURIComponent('/')
    const { pathname, search, hash } = window.location
    return encodeURIComponent(`${pathname}${search}${hash}`)
  }, [])

  void router.replace(`${redirectTo}?${CALLBACK_URL_KEY}=${redirectUrl}`)

  return <FullscreenSpinner />
}

/**
 * Page wrapper that renders children only if the login cookie is found.
 * Otherwise, will redirect to the route passed into the `redirectTo` prop.
 *
 * @note There is no authentication being performed by this component. This component is merely a wrapper that checks for the presence of the login cookie.
 */
export const PrivatePageWrapper = ({
  redirectTo = SIGN_IN,
  children,
}: PropsWithChildren<PrivatePageWrapperProps>): React.ReactElement => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <>{children}</>
  }

  return <Redirect redirectTo={redirectTo} />
}
