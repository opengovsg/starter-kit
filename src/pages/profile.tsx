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
} from '@chakra-ui/react';
import { useMemo } from 'react';
import { useUser } from '~/features/profile/api';
import { AvatarUpload } from '~/features/profile/components/AvatarUpload';
import { useZodForm } from '~/lib/form';
import { NextPageWithLayout } from '~/lib/types';
import { updateMeSchema } from '~/server/schemas/me';
import { AdminLayout } from '~/templates/layouts/AdminLayout';
import { trpc } from '~/utils/trpc';

import Image from 'next/image';
import profileAuntySvg from '~/features/profile/assets/profile-aunty.svg';

const Profile: NextPageWithLayout = () => {
  const { user: me } = useUser();
  const utils = trpc.useContext();

  const mutation = trpc.me.update.useMutation({
    async onSuccess() {
      await utils.me.get.invalidate();
    },
  });

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useZodForm({
    schema: updateMeSchema,
    values: useMemo(() => {
      return {
        name: me?.name ?? '',
        title: me?.title ?? '',
      };
    }, [me]),
  });

  const handleProfileUpdate = handleSubmit(async (values) => {
    return mutation.mutateAsync(values);
  });

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
      <Flex
        bg="white"
        borderWidth="1px"
        borderRadius="md"
        flexDir="column"
        px="3.5rem"
        py="3rem"
      >
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing="2rem"
          bg="white"
        >
          <AvatarUpload url={me?.image} />
          <Stack>
            <FormControl isRequired id="name" isInvalid={!!errors.name}>
              <FormLabel>Name</FormLabel>
              <Input {...register('name')} />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired id="title" isInvalid={!!errors.title}>
              <FormLabel>Job title</FormLabel>
              <Input {...register('title')} />
              <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
            </FormControl>
          </Stack>
        </Stack>
        <ButtonGroup borderTopWidth="1px">
          <Button onClick={handleProfileUpdate}>Update my profile</Button>
        </ButtonGroup>
      </Flex>
    </Box>
  );
};

Profile.getLayout = AdminLayout;

export default Profile;
