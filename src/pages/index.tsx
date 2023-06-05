import { Box } from '@chakra-ui/react'
import { useMe } from '~/features/me/api'

// TODO: Will be landing page in the future, now just a redirect to appropriate page.
const Index = () => {
  useMe({ redirectIfFound: true, redirectTo: '/dashboard' })

  return <Box>Redirecting....</Box>
}

export default Index
