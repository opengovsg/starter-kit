'use client'

import type { Dispatch, PropsWithChildren, SetStateAction } from 'react'
import { createContext, useContext, useState } from 'react'
import { useInterval } from 'usehooks-ts'

interface SignInState {
  timer: number
  resetTimer: () => void
  vfnStepData: VfnStepData | undefined
  setVfnStepData: Dispatch<SetStateAction<VfnStepData | undefined>>
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
}

export const SignInWizardProvider = ({
  children,
  delayForResendSeconds = 60,
}: PropsWithChildren<SignInWizardProviderProps>) => {
  const [vfnStepData, setVfnStepData] = useState<VfnStepData>()
  const [timer, setTimer] = useState(delayForResendSeconds)

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
      }}
    >
      {children}
    </SignInWizardContext.Provider>
  )
}
