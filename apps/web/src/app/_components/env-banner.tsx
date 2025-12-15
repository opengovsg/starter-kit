import { Banner } from '@opengovsg/oui/banner'

import { env } from '~/env'

export function EnvBanner() {
  if (env.NEXT_PUBLIC_APP_ENV === 'production') {
    return null
  }

  return (
    <Banner variant="warning" isDismissable={false} size="sm">
      This is a {env.NEXT_PUBLIC_APP_ENV} testing environment.
    </Banner>
  )
}
