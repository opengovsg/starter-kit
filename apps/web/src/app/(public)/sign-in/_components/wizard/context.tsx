'use client'

import type { PropsWithChildren } from 'react'

import { useRef, useState } from 'react'

import { useInterval } from 'usehooks-ts'

import type { VfnStepData } from './sign-in-state'

import { SignInWizardContext } from './sign-in-state'

import {
  browserCreatePkceChallenge,
  browserCreatePkceVerifier,
} from '~/lib/pkce/browser-pkce'

export type { VfnStepData } from './sign-in-state'

export { SignInWizardContext } from './sign-in-state'

export { useSignInWizard } from './use-sign-in-wizard'

interface SignInWizardProviderProps {
  /**
   * The number of seconds to wait before allowing the user to resend the OTP.
   * @default 60
   */
  delayForResendSeconds?: number
}

export const SignInWizardProvider = ({
  children,
  delayForResendSeconds = 60,
}: PropsWithChildren<SignInWizardProviderProps>) => {
  const [vfnStepData, setVfnStepData] = useState<VfnStepData>()
  const [timer, setTimer] = useState(delayForResendSeconds)

  const challengeToVerifierMap = useRef(new Map<string, string>())

  const newChallenge = async (): Promise<string | undefined> => {
    try {
      const verifier = browserCreatePkceVerifier()
      const challenge = await browserCreatePkceChallenge(verifier)
      challengeToVerifierMap.current.set(challenge, verifier)

      return challenge
    } catch (error) {
      console.error(error)
    }

    return undefined
  }

  const getVerifier = (challenge: string) =>
    challengeToVerifierMap.current.get(challenge)

  const clearVerifierMap = () => {
    challengeToVerifierMap.current.clear()
  }

  const resetTimer = () => {
    setTimer(delayForResendSeconds)
  }

  // Start the resend timer once in the vfn step.
  // Stop interval if timer hits 0, else rerun every 1000ms.
  useInterval(
    () => {
      setTimer((prev) => prev - 1)
    },
    vfnStepData !== undefined && timer > 0 ? 1000 : null
  )

  return (
    <SignInWizardContext.Provider
      value={{
        clearVerifierMap,
        getVerifier,
        newChallenge,
        resetTimer,
        setVfnStepData,
        timer,
        vfnStepData,
      }}
    >
      {children}
    </SignInWizardContext.Provider>
  )
}
