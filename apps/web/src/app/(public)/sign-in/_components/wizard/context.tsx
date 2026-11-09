'use client'

import type { PropsWithChildren } from 'react'

import { createContext, useContext, useRef, useState } from 'react'

import { useMachine } from '@xstate/react'
import { useInterval } from 'usehooks-ts'

import {
  createRestoredWizardSnapshot,
  emailWizardMachine,
} from './email/email-wizard.machine'
import type { VfnStepData } from './types'
import {
  clearPersistedVfnStep,
  persistVfnStep,
  readPersistedVfnStep,
} from './wizard-persistence'

import {
  browserCreatePkceChallenge,
  browserCreatePkceVerifier,
} from '~/lib/pkce/browser-pkce'

export type { VfnStepData } from './types'

const PKCE_MAP_MAX_ENTRIES = 2

interface SignInState {
  wizardStep: 'email' | 'verify'
  timer: number
  verifyInFlight: boolean
  vfnStepData: VfnStepData | undefined
  setVfnStepData: (data: VfnStepData) => void
  advanceToVerify: (data: VfnStepData) => void
  beginVerifySubmit: () => boolean
  endVerifySubmit: () => void
  completeVerify: () => void
  resetTimer: () => void
  getVerifier: (challenge: string) => string | undefined
  newChallenge: (activeChallenge?: string) => Promise<string | undefined>
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

const readInitialWizardSnapshot = (delayForResendSeconds: number) => {
  const persisted = readPersistedVfnStep()

  if (persisted !== undefined) {
    return createRestoredWizardSnapshot(delayForResendSeconds, persisted)
  }

  return null
}

export const SignInWizardProvider = ({
  children,
  delayForResendSeconds = 60,
}: PropsWithChildren<SignInWizardProviderProps>) => {
  const challengeToVerifierMap = useRef(new Map<string, string>())

  // oxlint-disable-next-line eslint/no-unused-vars -- setter required by react/hook-use-state.
  const [initialWizardSnapshot, setInitialWizardSnapshot] = useState(() =>
    readInitialWizardSnapshot(delayForResendSeconds)
  )

  const [state, send] = useMachine(emailWizardMachine, {
    input: { delayForResendSeconds },
    snapshot: initialWizardSnapshot ?? undefined,
  })

  const prunePkceMap = (activeChallenge?: string) => {
    const map = challengeToVerifierMap.current

    if (activeChallenge !== undefined) {
      map.delete(activeChallenge)
    }

    if (map.size >= PKCE_MAP_MAX_ENTRIES) {
      map.clear()
    }
  }

  const newChallenge = async (
    activeChallenge?: string
  ): Promise<string | undefined> => {
    try {
      prunePkceMap(activeChallenge)

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

  const advanceToVerify = (data: VfnStepData) => {
    send({ data, type: 'ADVANCE_TO_VERIFY' })
    persistVfnStep(data)
  }

  const setVfnStepData = (data: VfnStepData) => {
    send({ data, type: 'UPDATE_VFN_DATA' })
    persistVfnStep(data)
  }

  const beginVerifySubmit = () => {
    if (state.context.verifyInFlight) {
      return false
    }

    send({ type: 'BEGIN_VERIFY' })

    return true
  }

  const endVerifySubmit = () => {
    send({ type: 'END_VERIFY' })
  }

  const completeVerify = () => {
    clearPersistedVfnStep()
    send({ type: 'VERIFY_COMPLETE' })
  }

  const resetTimer = () => {
    send({ type: 'RESET_RESEND_TIMER' })
  }

  useInterval(
    () => {
      send({ type: 'TICK_RESEND_TIMER' })
    },
    state.matches('verify') && state.context.resendTimer > 0 ? 1000 : null
  )

  return (
    <SignInWizardContext.Provider
      value={{
        advanceToVerify,
        beginVerifySubmit,
        clearVerifierMap,
        completeVerify,
        endVerifySubmit,
        getVerifier,
        newChallenge,
        resetTimer,
        setVfnStepData,
        timer: state.context.resendTimer,
        verifyInFlight: state.context.verifyInFlight,
        vfnStepData: state.context.vfnStepData,
        wizardStep: state.matches('verify') ? 'verify' : 'email',
      }}
    >
      {children}
    </SignInWizardContext.Provider>
  )
}
