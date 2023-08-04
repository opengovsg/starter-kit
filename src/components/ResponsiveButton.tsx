import { useBreakpointValue } from '@chakra-ui/react'
import { type ButtonProps, Button } from '@opengovsg/design-system-react'

export const ResponsiveButton = (props: ButtonProps): JSX.Element => {
  const isFullWidth = useBreakpointValue({
    base: true,
    md: false,
  })

  return <Button isFullWidth={isFullWidth} {...props} />
}
