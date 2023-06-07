import { Stack, Text } from '@chakra-ui/react'
import Image from 'next/image'

interface FeatureGridItemProps {
  image?: string
  title: string
  description: string
}

export const FeatureGridItem = ({
  image,
  title,
  description,
}: FeatureGridItemProps): JSX.Element => {
  return (
    <Stack spacing="1rem">
      {image && (
        <Image
          style={{ maxWidth: '3rem' }}
          src={image}
          aria-hidden
          alt={description}
        />
      )}
      <Text as="h4" textStyle="h4" color="base.content.strong">
        {title}
      </Text>
      <Text textStyle="body-1" color="base.content.default">
        {description}
      </Text>
    </Stack>
  )
}
