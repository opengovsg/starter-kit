import { Box } from '@chakra-ui/react'
import { useUser } from '~/features/profile/api'

// TODO: Will be landing page in the future, now just a redirect to appropriate page.
const Index = () => {
  // On navigating to index, Users will be redirected to the /sign-in if they are not logged in, and /dashboard if they are
  // This is handled by the top level error boundary in the app root
  useUser({ redirectIfFound: true, redirectTo: '/dashboard' })

  return <Box />
}

export default Index
