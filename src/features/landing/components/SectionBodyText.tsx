import { Text, type TextProps } from '@chakra-ui/react'
import { type PropsWithChildren } from 'react'

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
