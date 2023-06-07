import { Flex, HStack, type As } from '@chakra-ui/react'
import {
  Button,
  IconButton,
  Link,
  useIsMobile,
} from '@opengovsg/design-system-react'
import NextLink from 'next/link'
import { SIGN_IN } from '~/constants/routes'
import { AppGrid } from '~/templates/AppGrid'

type PublicHeaderLinkProps = {
  label: string
  href: string
  showOnMobile?: boolean
  MobileIcon?: As
}

export interface AppPublicHeaderProps {
  /** Header links to display, if provided. */
  publicHeaderLinks?: PublicHeaderLinkProps[]
}

const PublicHeaderLink = ({
  showOnMobile,
  MobileIcon,
  href,
  label,
}: PublicHeaderLinkProps) => {
  const isMobile = useIsMobile()

  if (isMobile && !showOnMobile) {
    return null
  }

  if (isMobile && MobileIcon) {
    return (
      <IconButton
        variant="clear"
        as={NextLink}
        href={href}
        aria-label={label}
        icon={<MobileIcon fontSize="1.25rem" color="primary.500" />}
      />
    )
  }

  return (
    <Link
      as={NextLink}
      w="fit-content"
      variant="standalone"
      color="primary.500"
      href={href}
      aria-label={label}
    >
      {label}
    </Link>
  )
}

export const AppPublicHeader = ({
  publicHeaderLinks,
}: AppPublicHeaderProps): JSX.Element => {
  return (
    <AppGrid bg="base.canvas.brand-subtle">
      <Flex
        gridColumn={{ base: '1 / -1', md: '2 / 12' }}
        justify="space-between"
        align="center"
        py={{ base: '0.625rem', md: '4.5rem' }}
      >
        <NextLink href="/">Starter Kit</NextLink>
        <HStack
          textStyle="subhead-1"
          spacing={{ base: '1rem', md: '2rem', xl: '2.5rem' }}
        >
          {publicHeaderLinks?.map((link, index) => (
            <PublicHeaderLink key={index} {...link} />
          ))}
          <Button variant="solid" as={NextLink} href={SIGN_IN}>
            Log in
          </Button>
        </HStack>
      </Flex>
    </AppGrid>
  )
}
