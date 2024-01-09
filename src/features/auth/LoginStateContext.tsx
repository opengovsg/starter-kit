import {
  createContext,
  useContext,
  type PropsWithChildren,
  useCallback,
} from 'react'

import { LOGGED_IN_KEY } from '~/constants/localStorage'
import { useLocalStorage } from '~/hooks/useLocalStorage'

type LoginStateContextReturn = {
  hasLoginStateFlag?: boolean
  setHasLoginStateFlag: () => void
  removeLoginStateFlag: () => void
}

// Exported for testing.
export const LoginStateContext = createContext<LoginStateContextReturn | null>(
  null,
)

/**
 * Provider component that wraps your app and makes client login state boolean available
 * to any child component that calls `useLoginState()`.
 */
export const LoginStateProvider = ({ children }: PropsWithChildren) => {
  const loginState = useProvideLoginState()

  return (
    <LoginStateContext.Provider value={loginState}>
      {children}
    </LoginStateContext.Provider>
  )
}

/**
 * Hook for components nested in LoginStateProvider component to get the current login state.
 */
export const useLoginState = (): LoginStateContextReturn => {
  const context = useContext(LoginStateContext)
  if (!context) {
    throw new Error(
      `useLoginState must be used within a LoginStateProvider component`,
    )
  }
  return context
}

const useProvideLoginState = () => {
  const [hasLoginStateFlag, setLoginStateFlag] = useLocalStorage<boolean>(
    LOGGED_IN_KEY,
    undefined,
  )

  const setHasLoginStateFlag = useCallback(() => {
    setLoginStateFlag(true)
  }, [setLoginStateFlag])

  const removeLoginStateFlag = useCallback(() => {
    setLoginStateFlag(undefined)
  }, [setLoginStateFlag])

  return {
    hasLoginStateFlag: !!hasLoginStateFlag,
    setHasLoginStateFlag,
    removeLoginStateFlag,
  }
}
