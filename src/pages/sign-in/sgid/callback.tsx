import { FullscreenSpinner } from '~/components/FullscreenSpinner'
import { SgidCallback } from '~/features/sign-in/components'
import { withSuspense } from '~/hocs/withSuspense'

const SgidCallbackPage = withSuspense(SgidCallback, <FullscreenSpinner />)

export default SgidCallbackPage
