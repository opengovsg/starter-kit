import { Flex } from '@chakra-ui/react';
import { AppNavbar } from '~/components/AppNavbar';
import { DashSidebar } from '~/components/DashSidebar';
import { NextPageWithAuthAndLayout } from '~/lib/types';

export const AdminLayout: NextPageWithAuthAndLayout['getLayout'] = (page) => {
  return (
    <Flex minH="$100vh" flexDir="column">
      <AppNavbar />
      <Flex flex={1}>
        <DashSidebar />
        <Flex flex={1} bg="base.canvas.alt">
          {page}
        </Flex>
      </Flex>
    </Flex>
  );
};
