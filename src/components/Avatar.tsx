import {
  type AvatarProps as ChakraAvatarProps,
  Avatar as ChakraAvatar,
} from '@chakra-ui/react'

export const Avatar = (props: ChakraAvatarProps) => {
  return <ChakraAvatar bg="base.canvas.brand-subtle" {...props} />
}
