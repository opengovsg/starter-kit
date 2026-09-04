'use client'

import type { Dispatch, PropsWithChildren, SetStateAction } from 'react'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'

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
  undefined
)

export const useSignInWizard = () => {
  const context = useContext(SignInWizardContext)

  if (context === undefined) {
    throw new Error(
      `useSignInWizard must be used within a SignInWizardProvider.`
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

  const newChallenge = useCallback(async (): Promise<string | undefined> => {
    try {
      const verifier = browserCreatePkceVerifier()
      const challenge = await browserCreatePkceChallenge(verifier)
      challengeToVerifierMap.current.set(challenge, verifier)
      return challenge
    } catch (error) {
      console.error(error)
    }
    return undefined
  }, [])

  const getVerifier = useCallback(
    (challenge: string) => challengeToVerifierMap.current.get(challenge),
    []
  )

  const clearVerifierMap = useCallback(() => {
    challengeToVerifierMap.current.clear()
  }, [])

  const resetTimer = useCallback(() => {
    setTimer(delayForResendSeconds)
  }, [delayForResendSeconds])

  // Start the resend timer once in the vfn step.
  useInterval(
    () => {
      setTimer((prev) => prev - 1)
    },
    vfnStepData !== undefined && timer > 0 ? 1000 : null
  )

  const value = useMemo(
    () => ({
      clearVerifierMap,
      getVerifier,
      newChallenge,
      resetTimer,
      setVfnStepData,
      timer,
      vfnStepData,
    }),
    [
      clearVerifierMap,
      getVerifier,
      newChallenge,
      resetTimer,
      timer,
      vfnStepData,
    ]
  )

  return (
    <SignInWizardContext.Provider value={value}>
      {children}
    </SignInWizardContext.Provider>
  )
}
