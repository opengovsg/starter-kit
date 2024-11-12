import NextLink from 'next/link'
import { Divider, Flex, Link, Stack, Text } from '@chakra-ui/react'

import { AppFooter } from '~/components/AppFooter'
import { PublicPageWrapper } from '~/components/AuthWrappers'
import { APP_PX } from '~/constants/layouts'
import { SgidProfileList } from '~/features/sign-in/components/SgidProfileList'
import { useEnv } from '~/hooks/useEnv'
import { SIGN_IN } from '~/lib/routes'
import { type NextPageWithLayout } from '~/lib/types'
import { AppGrid } from '~/templates/AppGrid'

const SelectProfilePage: NextPageWithLayout = () => {
  const { env } = useEnv()

  return (
    <PublicPageWrapper strict>
      <Flex minH="$100vh" flexDir="column" bg="base.canvas.alt">
        <AppGrid flex={1} py="2rem" px={APP_PX}>
          <Stack
            my="auto"
            gridColumn={{ base: '1 / 5', md: '1 / 12', lg: '5 / 9' }}
            h="fit-content"
            flexDir="column"
            p="2rem"
            bg="white"
            gap={0}
            divider={<Divider />}
          >
            <Text textStyle="h4" color="base.content.strong" mb="2rem">
              Choose an account to continue to {env.NEXT_PUBLIC_APP_NAME}
            </Text>
            <SgidProfileList />
            <Link mt="2rem" as={NextLink} href={SIGN_IN} colorScheme="neutral">
              Or, log in manually using email and OTP{' '}
            </Link>
          </Stack>
        </AppGrid>
        <AppFooter />
      </Flex>
    </PublicPageWrapper>
  )
}

export default SelectProfilePage
