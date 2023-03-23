import { Avatar, Box, Flex, Icon, Skeleton } from '@chakra-ui/react';
import { Input, useToast } from '@opengovsg/design-system-react';
import { ChangeEventHandler, useMemo, useState } from 'react';
import { BiImageAdd } from 'react-icons/bi';
import { NextImage } from '~/components/NextImage';
import { useUploadAvatarMutation } from '../api';

interface AvatarUploadProps {
  url?: string | null;
}

export const AvatarUpload = ({ url }: AvatarUploadProps): JSX.Element => {
  // Will load this over `url` if provided for UX.
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string>();
  const [isHover, setIsHover] = useState(false);

  const avatarUrlToShow = useMemo(
    () => uploadedAvatarUrl ?? url,
    [uploadedAvatarUrl, url],
  );

  const toast = useToast({
    status: 'success',
  });

  const uploadAvatarMutation = useUploadAvatarMutation();

  const handleUploadAvatar: ChangeEventHandler<HTMLInputElement> = async (
    event,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      throw new Error('You must select an image to upload.');
    }

    return uploadAvatarMutation.mutateAsync(file, {
      onSuccess: async (newPath) => {
        setUploadedAvatarUrl(newPath);
        toast({
          description: 'Avatar uploaded successfully.',
        });
      },
      onError: (x) =>
        toast({
          status: 'error',
          description: (x as Error)?.message ?? 'Failed to upload avatar.',
        }),
    });
  };

  return (
    <Box
      pos="relative"
      cursor="pointer"
      onMouseOver={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <Flex
        as="label"
        transitionProperty="opacity"
        transitionDuration="0.2s"
        opacity={isHover ? 1 : 0}
        zIndex={1}
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.600"
        borderRadius="md"
        align="center"
        justify="center"
        cursor="pointer"
      >
        <Input
          isDisabled={uploadAvatarMutation.isLoading}
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={handleUploadAvatar}
          hidden
        />
        <Icon color="white" as={BiImageAdd} />
      </Flex>
      <Skeleton isLoaded={url !== undefined}>
        {avatarUrlToShow ? (
          <>
            <NextImage
              src={avatarUrlToShow}
              borderRadius="md"
              width="4rem"
              height="4rem"
              alt="profile picture"
            />
          </>
        ) : (
          <Avatar size="lg" borderRadius="md" />
        )}
      </Skeleton>
    </Box>
  );
};
