import { Box } from '@chakra-ui/react'
import { useMe } from '~/features/me/api'
import { HOME } from '~/lib/routes'

// TODO: Will be landing page in the future, now just a redirect to appropriate page.
const Index = () => {
  useMe({ redirectIfFound: true, redirectTo: HOME })

  return <Box>Redirecting....</Box>
}

export default Index
