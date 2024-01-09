import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  useContext,
  useState,
  useCallback,
  type SetStateAction,
} from 'react'
import { useInterval } from 'usehooks-ts'

interface SignInState {
  timer: number
  resetTimer: () => void
  state: 'initial' | 'email'
  vfnStepData: VfnStepData | undefined
  setVfnStepData: Dispatch<SetStateAction<VfnStepData | undefined>>
  proceedToEmail: () => void
  backToInitial: () => void
}

export const SignInContext = createContext<SignInState | undefined>(undefined)

export const useSignInContext = () => {
  const context = useContext(SignInContext)

  if (context === undefined) {
    throw new Error(
      `Must use sign in context within ${SignInContextProvider}.name`,
    )
  }

  return context
}

interface SignInContextProviderProps {
  /**
   * The number of seconds to wait before allowing the user to resend the OTP.
   * @default 60
   */
  delayForResendSeconds?: number
}

export type VfnStepData = {
  email: string
  otpPrefix: string
}

export const SignInContextProvider = ({
  children,
  delayForResendSeconds = 60,
}: PropsWithChildren<SignInContextProviderProps>) => {
  const [state, setState] = useState<'initial' | 'email'>('initial')
  const [vfnStepData, setVfnStepData] = useState<VfnStepData>()
  const [timer, setTimer] = useState(delayForResendSeconds)

  const resetTimer = useCallback(
    () => setTimer(delayForResendSeconds),
    [delayForResendSeconds],
  )

  const proceedToEmail = useCallback(() => {
    setState('email')
  }, [])

  const backToInitial = useCallback(() => {
    setState('initial')
    setVfnStepData(undefined)
  }, [])

  // Start the resend timer once in the vfn step.
  useInterval(
    () => setTimer(timer - 1),
    // Stop interval if timer hits 0, else rerun every 1000ms.
    !!vfnStepData && timer > 0 ? 1000 : null,
  )

  return (
    <SignInContext.Provider
      value={{
        vfnStepData,
        setVfnStepData,
        timer,
        resetTimer,
        proceedToEmail,
        backToInitial,
        state,
      }}
    >
      {children}
    </SignInContext.Provider>
  )
}
