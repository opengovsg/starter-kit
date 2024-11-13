import type { ComponentType } from 'react'
import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { type FallbackProps } from 'react-error-boundary'
import { z } from 'zod'

import { HOME } from '~/lib/routes'
import { safeSchemaJsonParse } from '~/utils/zod'
import { SgidErrorModal } from './SgidErrorModal'

export const SgidErrorFallback: ComponentType<FallbackProps> = ({ error }) => {
  const router = useRouter()
  const redirectUrl = useMemo(() => {
    const parsed = safeSchemaJsonParse(
      z.object({
        landingUrl: z.string(),
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
