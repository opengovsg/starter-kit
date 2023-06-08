import { type FC } from 'react'
import { Flex, type FlexProps } from '@chakra-ui/react'
import { AppGrid } from '~/templates/AppGrid'

export const LandingSection: FC<FlexProps> = ({ bg, children, ...props }) => {
  return (
    <AppGrid bg={bg}>
      <Flex
        gridColumn={{ base: '1 / -1', md: '2 / 12' }}
        // px={{ base: '1.5rem', md: '5.5rem', lg: '9.25rem' }}
        pt={{ base: '3.5rem', md: '5.5rem' }}
        pb={{ base: '3.5rem', md: '5.5rem' }}
        flexDir="column"
        {...props}
      >
        {children}
      </Flex>
    </AppGrid>
  )
}
