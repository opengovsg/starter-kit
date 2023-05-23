import { SimpleGrid } from '@chakra-ui/react'
import Image from 'next/image'
import { RouterOutput } from '~/utils/trpc'

export interface PostImagesProps {
  images: RouterOutput['post']['byUser']['posts'][number]['images']
}

export const PostImages = ({ images }: PostImagesProps): JSX.Element | null => {
  if (images.length === 0) {
    return null
  }

  return (
    <SimpleGrid
      py="0.5rem"
      // Clamp the number of columns between 1 and 2
      columns={Math.min(Math.max(images.length, 1), 4)}
      spacing="1.5rem"
    >
      {images.map((url, index) => (
        <Image
          data-value="post-action"
          key={index}
          alt={url}
          src={url}
          // Trick to get NextJS to load without setting specific width,
          // but constrain the width when rendered.
          width={1000 / images.length}
          height={0}
          sizes="100vw"
          style={{ width: '100%', height: 'auto' }}
        />
      ))}
    </SimpleGrid>
  )
}
