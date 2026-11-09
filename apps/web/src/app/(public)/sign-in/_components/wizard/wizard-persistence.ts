import { z } from 'zod'

import type { VfnStepData } from './types'

const STORAGE_KEY = 'sign-in-email-wizard-vfn'

const persistedVfnStepSchema = z.object({
  codeChallenge: z.string().min(1),
  email: z.string().min(1),
  otpPrefix: z.string(),
})

export const persistVfnStep = (data: VfnStepData): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // sessionStorage may be unavailable in private mode or SSR
  }
}

export const readPersistedVfnStep = (): VfnStepData | undefined => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)

    if (raw === null || raw === '') {
      return undefined
    }

    const parsed: unknown = JSON.parse(raw)
    const result = persistedVfnStepSchema.safeParse(parsed)

    if (result.success) {
      return result.data
    }
  } catch {
    // Ignore parse or access errors
  }

  return undefined
}

export const clearPersistedVfnStep = (): void => {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // sessionStorage may be unavailable
  }
}
