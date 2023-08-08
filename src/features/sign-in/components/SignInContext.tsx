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
  email: string
  setEmail: Dispatch<SetStateAction<string>>
  showVerificationStep: boolean
  setShowVerificationStep: Dispatch<SetStateAction<boolean>>
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

export const SignInContextProvider = ({
  children,
  delayForResendSeconds = 60,
}: PropsWithChildren<SignInContextProviderProps>) => {
  const [email, setEmail] = useState('')
  const [showVerificationStep, setShowVerificationStep] = useState(false)
  const [timer, setTimer] = useState(delayForResendSeconds)

  return (
    <SignInContext.Provider
      value={{
        email,
        setEmail,
        showVerificationStep,
        setShowVerificationStep,
        timer,
        setTimer,
        delayForResendSeconds,
      }}
    >
      {children}
    </SignInContext.Provider>
  )
}
