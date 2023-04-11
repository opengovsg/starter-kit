import {
  AvatarProps as ChakraAvatarProps,
  Avatar as ChakraAvatar,
} from '@chakra-ui/react'

export const Avatar = (props: ChakraAvatarProps) => {
  return (
    <ChakraAvatar variant="subtle" bg="base.canvas.brand-subtle" {...props} />
  )
}
