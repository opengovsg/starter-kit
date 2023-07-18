import { Stack, type StackProps } from '@chakra-ui/react'

export const ResponsiveModalButtonGroup = (props: StackProps): JSX.Element => {
  return (
    <Stack
      w="100%"
      justifyContent={{
        md: 'flex-end',
      }}
      flexDirection={{
        base: 'column',
        md: 'row',
      }}
      {...props}
    />
  )
}
