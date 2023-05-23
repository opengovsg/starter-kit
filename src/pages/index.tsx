import { Box } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useMe } from '~/features/me/api'
import { HOME } from '~/lib/routes'

// TODO: Will be landing page in the future, now just a redirect to appropriate page.
const Index = () => {
  const { me, isLoading } = useMe()
  const router = useRouter()

  if (isLoading) {
    return <Box>Loading....</Box>
  }

  if (!me) {
    router.push('/sign-in')
  } else {
    router.push(HOME)
  }

  return <Box>Redirecting....</Box>
}

export default Index
