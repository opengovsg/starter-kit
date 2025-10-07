import { type PropsWithChildren } from 'react'
import { Text } from '@chakra-ui/react'

export const SectionHeadingText = ({
  children,
}: PropsWithChildren): JSX.Element => {
  return (
    <Text textStyle="responsive-heading.heavy-480" color="base.content.strong">
      {children}
    </Text>
  )
}
