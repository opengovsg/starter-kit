import { Icon } from '@chakra-ui/react'
import { Link, type LinkProps } from '@opengovsg/design-system-react'
import NextLink, { type LinkProps as NextLinkProps } from 'next/link'
import { BiLeftArrowAlt } from 'react-icons/bi'

export interface BackBannerLinkProps
  extends Omit<LinkProps, 'as'>,
    Omit<NextLinkProps, 'as' | 'href'> {}

export const BackBannerLink = ({
  children,
  ...props
}: BackBannerLinkProps): JSX.Element => {
  return (
    <Link textStyle="subhead-2" variant="standalone" {...props} as={NextLink}>
      <Icon as={BiLeftArrowAlt} aria-hidden fontSize="1.25rem" mr="0.25rem" />
      {children}
    </Link>
  )
}
