import { Icon, Stack } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import { BiLeftArrowAlt } from 'react-icons/bi'
import { SignInForm } from '../SignInForm'
import { useSignInContext } from '../SignInContext'

export const EmailSignInState = (): JSX.Element => {
  const { backToInitial } = useSignInContext()

  return (
    <Stack w="100%" gap="1rem">
      <Button
        leftIcon={<Icon as={BiLeftArrowAlt} fontSize="1rem" mr="-4px" />}
        variant="link"
        size="xs"
        onClick={backToInitial}
      >
        Back
      </Button>
      <SignInForm />
    </Stack>
  )
}
