import { Container } from '@chakra-ui/react'
import { Spinner } from '@opengovsg/design-system-react'
import { useRouter } from 'next/router'
import { trpc } from '~/utils/trpc'

export const SgidCallbackLoading = () => {
  return (
    <Container
      display="flex"
      h="$100vh"
      justifyContent="center"
      alignItems="center"
    >
      <Spinner color="interaction.main.default" fontSize="2rem" />
    </Container>
  )
}

/**
 * This component is responsible for handling the callback from the SGID login.
 */
export const SgidCallback = () => {
  const router = useRouter()
  const {
    query: { code, state },
  } = router

  trpc.auth.sgid.callback.useSuspenseQuery(
    {
      code: String(code),
      state: String(state),
    },
    {
      onSuccess: ({ redirectUrl }) => {
        router.replace(redirectUrl)
      },
      onError: (error) => {
        // Server should return redirectUrl even on error, this function is a fallback.
        console.error(error)
        router.replace('/sign-in')
      },
    }
  )

  return <SgidCallbackLoading />
}
