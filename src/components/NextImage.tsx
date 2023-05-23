import { type FC, useState } from 'react'

import Image, { type ImageProps } from 'next/image'

import { Skeleton, Box, type BoxProps } from '@chakra-ui/react'

type Props = Omit<ImageProps, 'width' | 'height'> &
  BoxProps & {
    alt: string
    fallbackSrc?: string
  }

export const NextImage: FC<Props> = (props) => {
  const {
    src,
    alt,
    width,
    height,
    fallbackSrc = '',
    bgGradient,
    priority,
    quality,
    ...rest
  } = props
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const handleLoad = (result: {
    naturalWidth: number
    naturalHeight: number
  }) => {
    if (result.naturalWidth === 0) setIsError(true)
    else setIsLoaded(true)
  }
  const handleError = () => setIsError(true)
  return (
    <Box
      width={width}
      height={height}
      position="relative"
      overflow="hidden"
      {...rest}
    >
      <Skeleton
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        isLoaded={isLoaded}
      >
        <Image
          src={isError ? fallbackSrc : src}
          alt={alt}
          fill
          style={{
            objectFit: 'cover',
          }}
          onLoadingComplete={handleLoad}
          onError={handleError}
          priority={priority}
          quality={quality}
        />
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          bgGradient={bgGradient}
        />
      </Skeleton>
    </Box>
  )
}
