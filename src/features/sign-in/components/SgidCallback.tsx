import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { z } from 'zod'

import { trpc } from '~/utils/trpc'
import { HOME } from '~/lib/routes'
import { SgidErrorModal } from './SgidErrorModal'
import { useLoginState } from '~/features/auth'
import { safeSchemaJsonParse } from '~/utils/zod'
import { FullscreenSpinner } from '~/components/FullscreenSpinner'

/**
 * This component is responsible for handling the callback from the SGID login.
 */
export const SgidCallback = (): JSX.Element => {
  const { setHasLoginStateFlag } = useLoginState()

  // To store the first error since future errors will become invalid flows
  const [firstError, setFirstError] = useState('')
  const router = useRouter()
  const utils = trpc.useContext()
  const {
    query: { code, state },
  } = router

  const redirectUrl = useMemo(() => {
    const parsed = safeSchemaJsonParse(
      z.object({
        landingUrl: z.string(),
      }),
      String(state)
    )
    if (parsed.success) {
      return parsed.data.landingUrl
    }
    return HOME
  }, [state])

  const { data, error } = trpc.auth.sgid.callback.useQuery({
    code: String(code),
    state: String(state),
  })

  const handleSuccess = useCallback(async () => {
    if (data) {
      const { selectProfileStep } = data
      if (!selectProfileStep) {
        setHasLoginStateFlag()
        await utils.me.get.invalidate()
      }
      await router.replace(redirectUrl)
    }
  }, [data, redirectUrl, router, setHasLoginStateFlag, utils.me.get])

  useEffect(() => {
    if (data) {
      void handleSuccess()
    }
  }, [data, handleSuccess])

  useEffect(() => {
    if (error && !firstError) {
      setFirstError(error.message)
    }
  }, [error, firstError])

  return (
    <>
      {firstError && (
        <SgidErrorModal message={firstError} redirectUrl={redirectUrl} />
      )}
      <FullscreenSpinner />
    </>
  )
}
