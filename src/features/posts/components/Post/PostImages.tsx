import { Box, Image, SimpleGrid } from '@chakra-ui/react'
import { useMemo } from 'react'
import { type RouterOutput } from '~/utils/trpc'

export interface PostImagesProps {
  images: RouterOutput['post']['byUser']['posts'][number]['images']
}

export const PostImages = ({ images }: PostImagesProps): JSX.Element | null => {
  const imageContainerHeight = useMemo(() => {
    // Height = 16 rem if below 2 images, 8 rem if above 2 images
    return images.length <= 2 ? '16rem' : '8rem'
  }, [images.length])

  if (images.length === 0) {
    return null
  }

  return (
    <SimpleGrid
      py="0.5rem"
      // Clamp the number of columns between 1 and 2
      columns={Math.min(Math.max(images.length, 1), 2)}
      spacing="2px"
    >
      {images.map((url, index) => (
        <Box height={imageContainerHeight} data-value="post-action" key={index}>
          <Image
            alt="Uploaded image"
            src={url}
            h="100%"
            w="100%"
            objectFit="cover"
          />
        </Box>
      ))}
    </SimpleGrid>
  )
}
