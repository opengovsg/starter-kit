import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import { NextPageWithLayout } from '~/lib/types'
import { AdminLayout } from '~/templates/layouts/AdminLayout'

import Image from 'next/image'
import Link from 'next/link'
import profileAuntySvg from '~/features/profile/assets/profile-aunty.svg'

const Profile: NextPageWithLayout = () => {
  return (
    <Box px="1.5rem" w="100%">
      <Flex flexDir="row" align="center">
        <Text as="h1" textStyle="h4" mr="-0.5rem">
          User profile
        </Text>
        <Image
          height={72}
          priority
          src={profileAuntySvg}
          aria-hidden
          alt="Profile aunty"
        />
      </Flex>
      <Stack
        bg="white"
        borderWidth="1px"
        borderRadius="md"
        flexDir="column"
        px="3.5rem"
        py="3rem"
        spacing="2.5rem"
      >
        <Link href="/settings/profile">Edit profile</Link>
      </Stack>
    </Box>
  )
}

Profile.getLayout = AdminLayout

export default Profile
