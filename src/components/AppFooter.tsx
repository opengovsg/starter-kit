import { RestrictedFooter } from '@opengovsg/design-system-react'

import { useEnv } from '~/hooks/useEnv'

export const AppFooter = () => {
  const { env } = useEnv()
  return (
    // This component can only be used if this is an application created by OGP.
    <RestrictedFooter
      containerProps={{
        px: 0,
      }}
      appName={env.NEXT_PUBLIC_APP_NAME}
      appLink="/"
    />
  )
}
