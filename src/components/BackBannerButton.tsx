import { Icon } from '@chakra-ui/react'
import { Link, type LinkProps } from '@opengovsg/design-system-react'
import { BiLeftArrowAlt } from 'react-icons/bi'

export type BackBannerButtonProps = Omit<LinkProps, 'as'>

export const BackBannerButton = ({
  children,
  ...props
}: BackBannerButtonProps): JSX.Element => {
  return (
    <Link as="button" textStyle="subhead-2" variant="standalone" {...props}>
      <Icon as={BiLeftArrowAlt} aria-hidden fontSize="1.25rem" mr="0.25rem" />
      {children}
    </Link>
  )
}
