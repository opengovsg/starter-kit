import { type SetStateAction } from 'jotai'
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react'

type SignInStates = {
  timer: number
  setTimer: Dispatch<SetStateAction<number>>
  vfnStepData: VfnStepData | undefined
  setVfnStepData: Dispatch<SetStateAction<VfnStepData | undefined>>
  delayForResendSeconds: number
}

export const SignInContext = createContext<SignInStates | undefined>(undefined)

export const useSignInContext = () => {
  const context = useContext(SignInContext)

  if (context === undefined) {
    throw new Error(
      `Must use sign in context within ${SignInContextProvider}.name`
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
  const [vfnStepData, setVfnStepData] = useState<VfnStepData>()
  const [timer, setTimer] = useState(delayForResendSeconds)

  return (
    <SignInContext.Provider
      value={{
        vfnStepData,
        setVfnStepData,
        timer,
        setTimer,
        delayForResendSeconds,
      }}
    >
      {children}
    </SignInContext.Provider>
  )
}
