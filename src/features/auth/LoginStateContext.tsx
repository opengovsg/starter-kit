import { createContext, useContext, type PropsWithChildren } from 'react'
import { hasCookie } from 'cookies-next'

import { LOGGED_IN_KEY } from '~/constants/insecureCookies'

type LoginStateContextReturn = {
  hasLoginStateCookie?: boolean
}

// Exported for testing.
export const LoginStateContext = createContext<
  LoginStateContextReturn | undefined
>(undefined)

/**
 * Provider component that wraps your app and makes client login state boolean available
 * to any child component that calls `useLoginState()`.
 */
export const LoginStateProvider = ({ children }: PropsWithChildren) => {
  const auth = useProvideLoginState()

  return (
    <LoginStateContext.Provider value={auth}>
      {children}
    </LoginStateContext.Provider>
  )
}

/**
 * Hook for components nested in ProvideAuth component to get the current auth object.
 */
export const useLoginState = (): LoginStateContextReturn => {
  const context = useContext(LoginStateContext)
  if (!context) {
    throw new Error(
      `useLoginState must be used within a LoginStateProvider component`
    )
  }
  return context
}

const useProvideLoginState = () => {
  const hasLoginStateCookie = hasCookie(LOGGED_IN_KEY)

  return {
    hasLoginStateCookie,
  }
}
