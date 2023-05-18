import { Box, Icon } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import NextLink from 'next/link'
import { BiPlus } from 'react-icons/bi'
import { TeamFeedbackList } from '~/features/feedback/components'
import { PostComposeForm } from '~/features/posts/components/PostComposeForm'
import type { NextPageWithLayout } from '~/lib/types'
import { AdminLayout } from '~/templates/layouts/AdminLayout'

const Home: NextPageWithLayout = () => {
  return (
    <Box p="1.5rem" w="100%">
      <PostComposeForm />
      <Button
        as={NextLink}
        href="/feedback/new"
        leftIcon={<Icon fontSize="1.25rem" as={BiPlus} />}
      >
        Write feedback
      </Button>
      <TeamFeedbackList />
    </Box>
  )
}

Home.getLayout = AdminLayout

export default Home
