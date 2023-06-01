import { Box } from '@chakra-ui/react'
import { useUser } from '~/features/profile/api'

// TODO: Will be landing page in the future, now just a redirect to appropriate page.
const Index = () => {
  useUser({ redirectIfFound: true, redirectTo: '/dashboard' })

  return <Box />
}

export default Index
