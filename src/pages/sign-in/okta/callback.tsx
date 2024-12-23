import { withErrorBoundary } from 'react-error-boundary'

import { FullscreenSpinner } from '~/components/FullscreenSpinner'
import { SgidErrorFallback } from '~/features/sign-in/components/SgidErrorFallback/SgidErrorFallback'
import { withSuspense } from '~/hocs/withSuspense'
import { OktaCallback } from '~/features/sign-in/components/OktaLogin/OktaCallback'

const OktaCallbackPage = withErrorBoundary(
  withSuspense(OktaCallback, <FullscreenSpinner />),
  { FallbackComponent: SgidErrorFallback },
)

export default OktaCallbackPage
