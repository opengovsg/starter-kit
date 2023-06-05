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

export const SignInContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [email, setEmail] = useState('')
  const [showVerificationStep, setShowVerificationStep] = useState(false)
  const [timer, setTimer] = useState(60)

  return (
    <SignInContext.Provider
      value={{
        email,
        setEmail,
        showVerificationStep,
        setShowVerificationStep,
        timer,
        setTimer,
      }}
    >
      {children}
    </SignInContext.Provider>
  )
}
