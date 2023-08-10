import { Spinner } from '@opengovsg/design-system-react'
import { useRouter } from 'next/router'
import { type PropsWithChildren, useMemo } from 'react'
import { CALLBACK_URL_KEY } from '~/constants/params'
import { useAuth } from '~/features/auth'
import { SIGN_IN } from '~/lib/routes'

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

  return <Spinner />
}

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
