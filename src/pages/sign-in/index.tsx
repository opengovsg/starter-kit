import { Box, Flex, Text } from '@chakra-ui/react';
import { AppFooter } from '~/components/AppFooter';
import {
  BackgroundBox,
  BaseGridLayout,
  FooterGridArea,
  LoginGridArea,
  NonMobileSidebarGridArea,
} from './components/GridLayout';

import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { LoginImageSvgr } from './components/LoginImageSvgr';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '~/lib/auth';
import { getProviders, signIn } from 'next-auth/react';
import { Button } from '@opengovsg/design-system-react';

const SignIn = ({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <BackgroundBox>
      <BaseGridLayout flex={1}>
        <NonMobileSidebarGridArea>
          <LoginImageSvgr maxW="100%" aria-hidden />
        </NonMobileSidebarGridArea>
        <LoginGridArea>
          <Box minH={{ base: 'auto', lg: '17.25rem' }} w="100%">
            <Flex mb={{ base: '2.5rem', lg: 0 }} flexDir="column">
              <Text
                display={{ base: 'none', lg: 'initial' }}
                textStyle="responsive-heading.heavy-1280"
                mb="2.5rem"
              >
                Vibes for days
              </Text>
              <Box display={{ base: 'initial', lg: 'none' }}>
                <Box mb={{ base: '0.75rem', lg: '1.5rem' }}>
                  <Text textStyle="h3">GovLogin</Text>
                </Box>
                <Text
                  textStyle={{
                    base: 'responsive-heading.heavy',
                    md: 'responsive-heading.heavy-480',
                    lg: 'responsive-heading.heavy-1280',
                  }}
                >
                  Vibes for days
                </Text>
              </Box>
            </Flex>
            {Object.values(providers!).map((provider) => (
              <Box key={provider.name}>
                <Button onClick={() => signIn(provider.id)}>
                  Sign in with {provider.name}
                </Button>
              </Box>
            ))}
          </Box>
        </LoginGridArea>
      </BaseGridLayout>
      <BaseGridLayout
        bg={{ base: 'base.canvas.brandLight', lg: 'transparent' }}
      >
        <FooterGridArea>
          <AppFooter variant={{ lg: 'compact' }} />
        </FooterGridArea>
      </BaseGridLayout>
    </BackgroundBox>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  const providers = await getProviders();

  if (session?.user) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
      props: { providers },
    };
  }

  return {
    props: { providers },
  };
};

export default SignIn;
