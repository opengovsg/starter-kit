import { useMemo, type ComponentType } from 'react'
import { useRouter } from 'next/router'
import { type FallbackProps } from 'react-error-boundary'
import { z } from 'zod'

import { safeSchemaJsonParse } from '~/utils/zod'
import { routeKeySchema } from '~/schemas/url'
import { SgidErrorModal } from './SgidErrorModal'

export const SgidErrorFallback: ComponentType<FallbackProps> = ({ error }) => {
  const router = useRouter()
  const routeKey = useMemo(() => {
    const parsed = safeSchemaJsonParse(
      z.object({
        landingRouteKey: routeKeySchema,
      }),
      String(router.query.state),
    )
    if (parsed.success) {
      return parsed.data.landingRouteKey
    }
    return 'HOME'
  }, [router.query.state])

  return <SgidErrorModal message={error.message} redirectRouteKey={routeKey} />
}
