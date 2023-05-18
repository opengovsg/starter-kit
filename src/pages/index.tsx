import { Box } from '@chakra-ui/react'

import { withSessionSsr } from '~/lib/withSession'

// TODO: Will be landing page in the future, now just a redirect to appropriate page.
const Index = () => {
  return <Box />
}

export const getServerSideProps = withSessionSsr(async ({ req }) => {
  const user = req.session.user
  if (user) {
    return {
      redirect: {
        destination: '/dashboard',
      },
      props: {},
    }
  }

  return {
    redirect: {
      destination: '/sign-in',
    },
    props: {},
  }
})

export default Index
