import type { TextProps } from '@chakra-ui/react'
import { type PropsWithChildren } from 'react'
import { Text } from '@chakra-ui/react'

type SectionBodyTextProps = PropsWithChildren<TextProps>

export const SectionBodyText = ({
  children,
  ...textProps
}: SectionBodyTextProps): JSX.Element => {
  return (
    <Text textStyle="body-1" color="base.content.default" {...textProps}>
      {children}
    </Text>
  )
}
