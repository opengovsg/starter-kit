import { FullscreenSpinner } from '~/components/FullscreenSpinner'
import Suspense from '~/components/Suspense'
import { SgidCallback } from '~/features/sign-in/components'

const SgidCallbackPage = () => {
  return (
    <Suspense fallback={<FullscreenSpinner />}>
      <SgidCallback />
    </Suspense>
  )
}

export default SgidCallbackPage
