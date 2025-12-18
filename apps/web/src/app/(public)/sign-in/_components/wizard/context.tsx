'use client'

import type { Dispatch, PropsWithChildren, SetStateAction } from 'react'
import { createContext, useContext, useRef, useState } from 'react'
import { useInterval } from 'usehooks-ts'

import {
  browserCreatePkceChallenge,
  browserCreatePkceVerifier,
} from '~/lib/pkce/browser-pkce'

interface SignInState {
  timer: number
  resetTimer: () => void
  vfnStepData: VfnStepData | undefined
  setVfnStepData: Dispatch<SetStateAction<VfnStepData | undefined>>
  getVerifier: (challenge: string) => string | undefined
  newChallenge: () => Promise<string | undefined>
  clearVerifierMap: () => void
}

export const SignInWizardContext = createContext<SignInState | undefined>(
  undefined,
)

export const useSignInWizard = () => {
  const context = useContext(SignInWizardContext)

  if (context === undefined) {
    throw new Error(
      `useSignInWizard must be used within a SignInWizardProvider.`,
    )
  }

  return context
}

interface SignInWizardProviderProps {
  /**
   * The number of seconds to wait before allowing the user to resend the OTP.
   * @default 60
   */
  delayForResendSeconds?: number
}

export interface VfnStepData {
  email: string
  otpPrefix: string
  codeChallenge: string
}

export const SignInWizardProvider = ({
  children,
  delayForResendSeconds = 60,
}: PropsWithChildren<SignInWizardProviderProps>) => {
  const [vfnStepData, setVfnStepData] = useState<VfnStepData>()
  const [timer, setTimer] = useState(delayForResendSeconds)

  const challengeToVerifierMap = useRef(new Map<string, string>())
  const newChallenge = async () => {
    try {
      const verifier = browserCreatePkceVerifier()
      const challenge = await browserCreatePkceChallenge(verifier)
      challengeToVerifierMap.current.set(challenge, verifier)
      return challenge
    } catch (error) {
      console.error(error)
      return undefined
    }
  }
  const getVerifier = (challenge: string) => {
    return challengeToVerifierMap.current.get(challenge)
  }
  const clearVerifierMap = () => {
    challengeToVerifierMap.current.clear()
  }

  const resetTimer = () => setTimer(delayForResendSeconds)

  // Start the resend timer once in the vfn step.
  useInterval(
    () => setTimer(timer - 1),
    // Stop interval if timer hits 0, else rerun every 1000ms.
    !!vfnStepData && timer > 0 ? 1000 : null,
  )

  return (
    <SignInWizardContext.Provider
      value={{
        vfnStepData,
        setVfnStepData,
        timer,
        resetTimer,
        newChallenge,
        getVerifier,
        clearVerifierMap,
      }}
    >
      {children}
    </SignInWizardContext.Provider>
  )
}
