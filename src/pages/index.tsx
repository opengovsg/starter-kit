import {
  Box,
  Icon,
  Skeleton,
  Stack,
  TabList,
  TabPanel,
  TabPanels,
  Text,
} from '@chakra-ui/react';
import { Button, Tab, Tabs } from '@opengovsg/design-system-react';
import Image from 'next/image';
import NextLink from 'next/link';
import { BiPlus } from 'react-icons/bi';
import feedbackUncleSvg from '~/features/feedback/assets/feedback-uncle.svg';
import { TeamFeedbackTab } from '~/features/feedback/components/TeamFeedbackTab';
import type { NextPageWithAuthAndLayout } from '~/lib/types';
import { AdminLayout } from '~/templates/layouts/AdminLayout';
import { trpc } from '~/utils/trpc';

const Home: NextPageWithAuthAndLayout = () => {
  const { data: counts, isLoading: unreadCountIsLoading } =
    trpc.post.unreadCount.useQuery();

  return (
    <Box p="1.5rem" w="100%">
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
        <Tabs>
          <TabList
            py="0.75rem"
            px="2rem"
            borderBottomWidth="1px"
            borderColor="base.divider.medium"
          >
            <Tab>Team</Tab>
            <Tab>Personal</Tab>
          </TabList>
          <TabPanels>
            <TeamFeedbackTab />
            <TabPanel>Content of Personal feedback tab</TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

Home.auth = true;

Home.getLayout = AdminLayout;

export default Home;

/**
 * If you want to statically render this page
 * - Export `appRouter` & `createContext` from [trpc].ts
 * - Make the `opts` object optional on `createContext()`
 *
 * @link https://trpc.io/docs/ssg
 */
// export const getStaticProps = async (
//   context: GetStaticPropsContext<{ filter: string }>,
// ) => {
//   const ssg = createProxySSGHelpers({
//     router: appRouter,
//     ctx: await createContext(),
//   });
//
//   await ssg.post.all.fetch();
//
//   return {
//     props: {
//       trpcState: ssg.dehydrate(),
//       filter: context.params?.filter ?? 'all',
//     },
//     revalidate: 1,
//   };
// };
