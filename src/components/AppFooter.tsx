import { RestrictedFooter } from '@opengovsg/design-system-react'
import { env } from '~/env.mjs'

export const AppFooter = () => {
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
