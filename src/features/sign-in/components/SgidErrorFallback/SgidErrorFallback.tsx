import { useMemo, type ComponentType } from 'react'
import { useRouter } from 'next/router'
import { type FallbackProps } from 'react-error-boundary'
import { z } from 'zod'

import { safeSchemaJsonParse } from '~/utils/zod'
import { type CallbackRoute, HOME } from '~/lib/routes'
import { callbackUrlSchema } from '~/schemas/url'
import { SgidErrorModal } from './SgidErrorModal'

export const SgidErrorFallback: ComponentType<FallbackProps> = ({ error }) => {
  const router = useRouter()
  const redirectUrl: CallbackRoute = useMemo(() => {
    const parsed = safeSchemaJsonParse(
      z.object({
        landingUrl: callbackUrlSchema,
      }),
      String(router.query.state),
    )
    if (parsed.success) {
      return parsed.data.landingUrl
    }
    return HOME
  }, [router.query.state])

  return <SgidErrorModal message={error.message} redirectUrl={redirectUrl} />
}
