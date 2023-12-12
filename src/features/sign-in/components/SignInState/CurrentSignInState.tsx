import { useSignInContext } from '../SignInContext'
import { EmailSignInState } from './EmailSignInState'
import { InitialSignInState } from './InitialSignInState'

export const CurrentSignInState = (): JSX.Element => {
  const { state } = useSignInContext()

  switch (state) {
    case 'initial':
      return <InitialSignInState />
    case 'email':
      return <EmailSignInState />
  }
}
