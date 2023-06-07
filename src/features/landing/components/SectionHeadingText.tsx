import { Text } from '@chakra-ui/react'
import { type PropsWithChildren } from 'react'

export const SectionHeadingText = ({
  children,
}: PropsWithChildren): JSX.Element => {
  return (
    <Text textStyle="responsive-heading.heavy-480" color="base.content.strong">
      {children}
    </Text>
  )
}
