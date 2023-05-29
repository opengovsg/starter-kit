import {
  Avatar,
  Box,
  Flex,
  Icon,
  Image,
  SkeletonCircle,
  Spinner,
} from '@chakra-ui/react'
import { Input, useToast } from '@opengovsg/design-system-react'
import { type ChangeEventHandler, useMemo, useState } from 'react'
import { BiImageAdd } from 'react-icons/bi'
import { env } from '~/env.mjs'
import { useUploadAvatarMutation } from '../api'

interface AvatarUploadProps {
  name?: string | null
  url?: string | null
}

const CAN_UPLOAD = !!env.NEXT_PUBLIC_ENABLE_STORAGE

export const AvatarUpload = ({ url, name }: AvatarUploadProps): JSX.Element => {
  // Will load this over `url` if provided for UX.
  const [isHover, setIsHover] = useState(false)

  const toast = useToast({
    status: 'success',
  })

  const uploadAvatarMutation = useUploadAvatarMutation()

  const handleUploadAvatar: ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const file = event.target.files?.[0]
    if (!file) {
      throw new Error('You must select an image to upload.')
    }

    return uploadAvatarMutation.mutate(file, {
      onSuccess: async () => {
        toast({
          description: 'Avatar uploaded successfully.',
        })
      },
      onError: (x) =>
        toast({
          status: 'error',
          description: (x as Error)?.message ?? 'Failed to upload avatar.',
        }),
    })
  }

  const hoverProps = useMemo(() => {
    if (!CAN_UPLOAD) {
      return {}
    }
    return {
      onMouseOver: () => setIsHover(true),
      onMouseLeave: () => setIsHover(false),
    }
  }, [])

  return (
    <Box pos="relative">
      <Flex
        {...hoverProps}
        as="label"
        transitionProperty="opacity"
        transitionDuration="0.2s"
        opacity={isHover && !uploadAvatarMutation.isLoading ? 1 : 0}
        zIndex={1}
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.600"
        borderRadius="full"
        align="center"
        justify="center"
        cursor={
          !CAN_UPLOAD || uploadAvatarMutation.isLoading ? 'default' : 'pointer'
        }
        w="7rem"
        h="7rem"
      >
        <Input
          isDisabled={!CAN_UPLOAD || uploadAvatarMutation.isLoading}
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={handleUploadAvatar}
          hidden
        />
        <Icon color="white" fontSize="2rem" as={BiImageAdd} />
      </Flex>
      <SkeletonCircle
        w="7rem"
        h="7rem"
        isLoaded={url !== undefined}
        pos="relative"
      >
        {url ? (
          <Image
            bg="base.canvas.brand-subtle"
            src={url}
            borderRadius="full"
            width="7rem"
            height="7rem"
            alt="profile picture"
          />
        ) : (
          <Avatar
            name={name ?? ''}
            size="2xl"
            w="7rem"
            h="7rem"
            variant="subtle"
            bg="base.canvas.brand-subtle"
          />
        )}
        {uploadAvatarMutation.isLoading && (
          <Flex
            pos="absolute"
            top={0}
            left={0}
            bottom={0}
            right={0}
            bg="whiteAlpha.800"
            align="center"
            justify="center"
          >
            <Spinner />
          </Flex>
        )}
      </SkeletonCircle>
    </Box>
  )
}
