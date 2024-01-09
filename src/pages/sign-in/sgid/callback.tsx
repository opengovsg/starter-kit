import { FullscreenSpinner } from '~/components/FullscreenSpinner'
import { SgidCallback } from '~/features/sign-in/components'
import { withSuspense } from '~/hocs/withSuspense'
import { withErrorBoundary } from 'react-error-boundary'
import { SgidErrorFallback } from '~/features/sign-in/components/SgidErrorFallback/SgidErrorFallback'

const SgidCallbackPage = withErrorBoundary(
  withSuspense(SgidCallback, <FullscreenSpinner />),
  { FallbackComponent: SgidErrorFallback },
)

export default SgidCallbackPage
