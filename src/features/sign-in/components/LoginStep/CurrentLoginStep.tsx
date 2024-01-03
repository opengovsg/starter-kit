import { useMemo } from 'react'
import { useSignInContext } from '../SignInContext'
import { InitialLoginStep } from './InitialLoginStep'
import { Flex } from '@chakra-ui/react'
import { EmailLoginStep } from './EmailLoginStep'

export const CurrentLoginStep = (): JSX.Element => {
  const { state } = useSignInContext()

  const stepToRender = useMemo(() => {
    switch (state) {
      case 'initial':
        return <InitialLoginStep />
      case 'email':
        return <EmailLoginStep />
    }
  }, [state])

  return (
    // Fixed height so the page can be (relatively) centered without any layout shift.
    <Flex w="100%" h={{ lg: '16rem' }}>
      {stepToRender}
    </Flex>
  )
}
