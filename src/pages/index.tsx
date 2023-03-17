import { Box } from '@chakra-ui/react';

import type { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '~/lib/auth';

// TODO: Will be landing page in the future, now just a redirect to appropriate page.
const Index = () => {
  return <Box />;
};

export const getServerSideProps = async ({
  req,
  res,
}: GetServerSidePropsContext) => {
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: '/dashboard',
      },
    };
  }

  return {
    redirect: {
      destination: '/sign-in',
    },
  };
};

export default Index;
