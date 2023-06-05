import { Box } from '@chakra-ui/react'
import { useUser } from '~/features/profile/api'

// TODO: Will be landing page in the future, now just a redirect to appropriate page.
const Index = () => {
  // On navigating to index, Users will be redirected to the /sign-in if they are not logged in, and /dashboard if they are
  useUser({ redirectIfFound: true, redirectTo: '/dashboard' })

  return <Box />
}

export default Index
