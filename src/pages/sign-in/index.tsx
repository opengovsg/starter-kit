import { Box, Flex, Text } from '@chakra-ui/react';
import { AppFooter } from '~/components/AppFooter';
import {
  BackgroundBox,
  BaseGridLayout,
  FooterGridArea,
  LoginGridArea,
  NonMobileSidebarGridArea,
} from './components/GridLayout';
import { LoginImageSvgr } from './components/LoginImageSvgr';

const SignIn = (): JSX.Element => {
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

export default SignIn;
