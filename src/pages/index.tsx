import { Box } from '@chakra-ui/react';
import { AppNavbar } from '~/components/AppNavbar';
import type { NextPageWithAuthAndLayout } from '~/lib/types';

const Home: NextPageWithAuthAndLayout = () => {
  return <Box>This is home, truly, where I know I must be</Box>;
};

Home.auth = true;

Home.getLayout = (page) => {
  return (
    <Box>
      <AppNavbar />
      {page}
    </Box>
  );
};

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
