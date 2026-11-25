import type { Dispatch, SetStateAction } from 'react'

import { createContext } from 'react'

export interface VfnStepData {
  email: string
  otpPrefix: string
  codeChallenge: string
}

export interface SignInState {
  timer: number
  resetTimer: () => void
  vfnStepData: VfnStepData | undefined
  setVfnStepData: Dispatch<SetStateAction<VfnStepData | undefined>>
  getVerifier: (challenge: string) => string | undefined
  newChallenge: () => Promise<string | undefined>
  clearVerifierMap: () => void
}

export const SignInWizardContext = createContext<SignInState | undefined>(
  undefined
)
