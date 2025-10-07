import { withErrorBoundary } from 'react-error-boundary'

import { FullscreenSpinner } from '~/components/FullscreenSpinner'
import { SgidCallback } from '~/features/sign-in/components'
import { SgidErrorFallback } from '~/features/sign-in/components/SgidErrorFallback/SgidErrorFallback'
import { withSuspense } from '~/hocs/withSuspense'

const SgidCallbackPage = withErrorBoundary(
  withSuspense(SgidCallback, <FullscreenSpinner />),
  { FallbackComponent: SgidErrorFallback },
)

export default SgidCallbackPage
