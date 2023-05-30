import Suspense from '~/components/Suspense'
import {
  SgidCallback,
  SgidCallbackLoading,
} from '~/features/sign-in/components'

const SgidCallbackPage = () => {
  return (
    <Suspense fallback={<SgidCallbackLoading />}>
      <SgidCallback />
    </Suspense>
  )
}

export default SgidCallbackPage
