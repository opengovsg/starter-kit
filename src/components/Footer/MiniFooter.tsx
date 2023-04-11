import { Link, Text } from '@chakra-ui/react'
import ogpLogoFull from '~/assets/ogp-logo-full.svg'
import NextLink from 'next/link'
import Image from 'next/image'

export const MiniFooter = (): JSX.Element => {
  return (
    <Text
      display="flex"
      alignItems="center"
      whiteSpace="pre"
      lineHeight="1rem"
      fontWeight={500}
      letterSpacing="0.08em"
      textTransform="uppercase"
      fontSize="0.625rem"
    >
      Built by{' '}
      <Link as={NextLink} title="To OGP homepage" href="https://open.gov.sg">
        <Image src={ogpLogoFull} alt="OGP Logo" priority />
      </Link>
    </Text>
  )
}
