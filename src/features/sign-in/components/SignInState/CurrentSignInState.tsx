import { useMemo } from 'react'
import { useSignInContext } from '../SignInContext'
import { EmailSignInState } from './EmailSignInState'
import { InitialSignInState } from './InitialSignInState'
import { Flex } from '@chakra-ui/react'

export const CurrentSignInState = (): JSX.Element => {
  const { state } = useSignInContext()

  const stateToRender = useMemo(() => {
    switch (state) {
      case 'initial':
        return <InitialSignInState />
      case 'email':
        return <EmailSignInState />
    }
  }, [state])

  return (
    // Fixed height so the page can be (relatively) centered without any layout shift.
    <Flex w="100%" h={{ lg: '20rem' }}>
      {stateToRender}
    </Flex>
  )
}
