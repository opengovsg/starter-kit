import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { useUser } from '~/features/profile/api'
import { AvatarUpload } from '~/features/profile/components/AvatarUpload'
import { useZodForm } from '~/lib/form'
import { type NextPageWithLayout } from '~/lib/types'
import { updateMeSchema } from '~/schemas/me'
import { AdminLayout } from '~/templates/layouts/AdminLayout'
import { trpc } from '~/utils/trpc'

import { useToast } from '@opengovsg/design-system-react'
import { ProfileAuntySvgr } from '~/features/profile/components/ProfileAuntySvgr'

const Profile: NextPageWithLayout = () => {
  const { user: me } = useUser()
  const utils = trpc.useContext()
  const toast = useToast({
    status: 'success',
  })

  const mutation = trpc.me.update.useMutation({
    async onSuccess() {
      toast({
        description: 'Profile updated successfully.',
      })
      await utils.me.get.invalidate()
    },
  })

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useZodForm({
    schema: updateMeSchema,
    values: useMemo(() => {
      return {
        name: me?.name ?? '',
        bio: me?.bio ?? '',
      }
    }, [me]),
  })

  const handleProfileUpdate = handleSubmit((values) => {
    return mutation.mutate(values)
  })

  return (
    <Box px="1.5rem" w="100%">
      <Flex flexDir="row" align="center">
        <Text as="h1" textStyle="h4" mr="-0.5rem">
          User profile
        </Text>
        <ProfileAuntySvgr aria-hidden />
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
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing="2rem"
          bg="white"
        >
          <AvatarUpload url={me?.image} name={me?.name} />
          <Stack flex={1}>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>Email</FormLabel>
              <Input isDisabled value={me?.email ?? ''} />
            </FormControl>
            <FormControl id="name" isInvalid={!!errors.name}>
              <FormLabel>Name</FormLabel>
              <Input {...register('name')} />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>
            <FormControl id="title" isInvalid={!!errors.bio}>
              <FormLabel>Bio</FormLabel>
              <Textarea {...register('bio')} />
              <FormErrorMessage>{errors.bio?.message}</FormErrorMessage>
            </FormControl>
          </Stack>
        </Stack>
        <ButtonGroup justifyContent="end">
          <Button onClick={handleProfileUpdate}>Update my profile</Button>
        </ButtonGroup>
      </Stack>
    </Box>
  )
}

Profile.getLayout = AdminLayout

export default Profile
