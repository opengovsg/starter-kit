'use client'

import { useRouter } from '@tanstack/react-router'

import { Button } from '@opengovsg/oui'
import { BiArrowBack } from 'react-icons/bi'

export const BackButton = () => {
  const router = useRouter()

  return (
    <Button
      startContent={<BiArrowBack />}
      variant="clear"
      size="xs"
      onPress={() => router.history.back()}
    >
      Back
    </Button>
  )
}
