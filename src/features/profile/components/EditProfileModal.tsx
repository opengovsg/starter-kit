import {
  Button,
  ButtonGroup,
  FormControl,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Text,
  UseDisclosureReturn,
} from '@chakra-ui/react';
import {
  FormErrorMessage,
  FormLabel,
  Input,
} from '@opengovsg/design-system-react';
import { useMemo } from 'react';
import { useZodForm } from '~/lib/form';
import { updateMeSchema } from '~/server/schemas/me';
import { trpc } from '~/utils/trpc';
import { AvatarUpload } from './AvatarUpload';

export type EditProfileModalProps = Pick<
  UseDisclosureReturn,
  'isOpen' | 'onClose'
>;

export const EditProfileModal = ({
  isOpen,
  onClose,
}: EditProfileModalProps): JSX.Element => {
  const { data: me } = trpc.me.get.useQuery();

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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Stack direction="row" spacing="1rem">
            <AvatarUpload url={me?.image ?? ''} />
            <Stack spacing={0}>
              <Heading size="lg">{me?.name}</Heading>
              <Text textStyle="body-2">{me?.title}</Text>
            </Stack>
          </Stack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
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
        </ModalBody>

        <ModalFooter>
          <ButtonGroup borderTopWidth="1px">
            <Button variant="outline" colorScheme="sub" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleProfileUpdate}>Update my profile</Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
