import { Link, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import Image from 'next/image'

export const RestrictedMiniFooter = (): JSX.Element => {
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
        <Image
          src="/assets/restricted-ogp-logo-full.svg"
          width={233}
          height={12}
          alt="OGP Logo"
          priority
        />
      </Link>
    </Text>
  )
}
