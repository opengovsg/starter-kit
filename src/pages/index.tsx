import { Box } from '@chakra-ui/react';
import { Button } from '@opengovsg/design-system-react';
import NextLink from 'next/link';
import type { NextPageWithAuthAndLayout } from '~/lib/types';
import { AdminLayout } from '~/templates/layouts/AdminLayout';

const Home: NextPageWithAuthAndLayout = () => {
  return (
    <Box>
      <Button as={NextLink} href="/feedback/new">
        Write feedback
      </Button>
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
