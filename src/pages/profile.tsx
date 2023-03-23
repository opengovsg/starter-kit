import {
  Button,
  ButtonGroup,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
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
    <Container>
      <Stack direction="row" spacing="1rem">
        <AvatarUpload url={me?.image} />
        <Stack spacing={0}>
          <Heading size="lg">{me?.name}</Heading>
          <Text textStyle="body-2">{me?.title}</Text>
        </Stack>
      </Stack>
      <Heading size="md">Your personal info</Heading>
      <SimpleGrid columns={2} spacing="1rem">
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
      </SimpleGrid>
      <ButtonGroup borderTopWidth="1px">
        <Button onClick={handleProfileUpdate}>Update my profile</Button>
      </ButtonGroup>
    </Container>
  );
};

Profile.getLayout = AdminLayout;

export default Profile;
