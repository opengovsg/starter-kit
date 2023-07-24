import { ButtonGroup, type StackProps } from '@chakra-ui/react'

export const ResponsiveModalButtonGroup = (props: StackProps): JSX.Element => {
  return (
    <ButtonGroup
      w="100%"
      justifyContent={{
        md: 'flex-end',
      }}
      flexDirection={{
        base: 'row-reverse',
        md: 'row',
      }}
      {...props}
    />
  )
}
