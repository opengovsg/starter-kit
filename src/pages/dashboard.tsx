import { Box, Icon, Skeleton, Stack, Text } from '@chakra-ui/react';
import { Button } from '@opengovsg/design-system-react';
import Image from 'next/image';
import NextLink from 'next/link';
import { BiPlus } from 'react-icons/bi';
import feedbackUncleSvg from '~/features/feedback/assets/feedback-uncle.svg';
import { FeedbackDrawer } from '~/features/feedback/components/FeedbackDrawer';
import { TeamFeedbackList } from '~/features/feedback/components';
import type { NextPageWithLayout } from '~/lib/types';
import { AdminLayout } from '~/templates/layouts/AdminLayout';
import { trpc } from '~/utils/trpc';
import { TeamFeedbackFilterBar } from '~/features/feedback/components/TeamFeedbackFilterBar';

const Dashboard: NextPageWithLayout = () => {
  const { data: counts, isLoading: unreadCountIsLoading } =
    trpc.post.unreadCount.useQuery();

  return (
    <Box p="1.5rem" w="100%">
      <FeedbackDrawer />
      <Stack justify="space-between" flexDir="row">
        <Stack flexDir="row" align="center">
          <Image
            height={72}
            priority
            style={{
              transform: 'scale(-1,1)',
            }}
            src={feedbackUncleSvg}
            aria-hidden
            alt="Feedback uncle"
          />
          <Skeleton isLoaded={!unreadCountIsLoading}>
            <Text textStyle="subhead-1" color="base.content.medium">
              <Text as="span" textStyle="h4" color="base.content.default">
                {counts?.unreadCount ?? 0}
              </Text>{' '}
              unread feedback of {counts?.totalCount ?? 0}
            </Text>
          </Skeleton>
        </Stack>
        <Button
          as={NextLink}
          href="/feedback/new"
          leftIcon={<Icon fontSize="1.25rem" as={BiPlus} />}
        >
          Write feedback
        </Button>
      </Stack>
      <Box bg="white" borderRadius="sm" borderWidth="1px">
        <TeamFeedbackFilterBar />
        <TeamFeedbackList />
      </Box>
    </Box>
  );
};

Dashboard.getLayout = AdminLayout;

export default Dashboard;
