import { type FC } from 'react'
import { Box, Flex, Image, Stack, type StackProps } from '@chakra-ui/react'

import { LandingSection } from './LandingSection'
import { SectionHeadingText } from './SectionHeadingText'

interface FeatureSectionProps extends StackProps {
  title: string
  imgSrc?: string
  description?: string
}

export const FeatureSection: FC<FeatureSectionProps> = ({
  children,
  imgSrc,
  title,
  direction = 'row',
  align = 'center',
  bg,
  description,
  ...wrapProps
}) => {
  return (
    <LandingSection bg={bg}>
      <Stack
        spacing={{ base: '2.5rem', lg: '8.25rem' }}
        direction={direction}
        align={align}
        {...wrapProps}
      >
        <Flex flexDir="column" flex={1}>
          <SectionHeadingText>{title}</SectionHeadingText>
          {children}
        </Flex>
        {imgSrc ? (
          <Box flex={1} aria-hidden>
            <Image alt={description ?? 'Feature description'} src={imgSrc} />
          </Box>
        ) : null}
      </Stack>
    </LandingSection>
  )
}
