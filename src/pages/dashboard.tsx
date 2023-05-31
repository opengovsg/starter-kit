import { Box, Skeleton } from '@chakra-ui/react'
import {
  FeedbackActionsModal,
  TeamFeedbackList,
} from '~/features/feedback/components'
import type { NextPageWithLayout } from '~/lib/types'
import { AdminLayout } from '~/templates/layouts/AdminLayout'
import { TeamFeedbackFilterBar } from '~/features/feedback/components/TeamFeedbackFilterBar'
import Suspense from '~/components/Suspense'
import { TeamFeedbackListSkeleton } from '~/features/feedback/components/TeamFeedbackListSkeleton'
import ErrorBoundary from '~/components/ErrorBoundary/ErrorBoundary'
import { FeedbackHeader } from '~/features/feedback/components/FeedbackHeader'

const Dashboard: NextPageWithLayout = () => {
  return (
    <Box p="1.5rem" w="100%">
      <ErrorBoundary>
        <Suspense fallback={<Skeleton height="100%" width="100%" />}>
          <DashboardContainer />
        </Suspense>
      </ErrorBoundary>

      <FeedbackActionsModal />
    </Box>
  )
}

const DashboardContainer = () => {
  return (
    <>
      <Suspense fallback={<Skeleton height="100px" width="100%" />}>
        <FeedbackHeader />
      </Suspense>

      <Suspense fallback={<TeamFeedbackListSkeleton />}>
        <Box
          bg="white"
          borderRadius="sm"
          borderWidth="1px"
          borderColor="base.divider.medium"
        >
          <TeamFeedbackFilterBar />
          <TeamFeedbackList />
        </Box>
      </Suspense>
    </>
  )
}

Dashboard.getLayout = AdminLayout

export default Dashboard
