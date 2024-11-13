import {
  RestrictedFooter,
  type RestrictedFooterProps,
} from '@opengovsg/design-system-react'

import { useEnv } from '~/hooks/useEnv'

export const AppFooter = (props: Partial<RestrictedFooterProps>) => {
  const { env } = useEnv()
  return (
    // This component can only be used if this is an application created by OGP.
    <RestrictedFooter
      appName={env.NEXT_PUBLIC_APP_NAME}
      appLink="/"
      {...props}
    />
  )
}
