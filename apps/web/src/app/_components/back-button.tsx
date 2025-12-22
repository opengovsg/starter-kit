'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@opengovsg/oui'
import { BiArrowBack } from 'react-icons/bi'

export const BackButton = () => {
  const router = useRouter()

  return (
    <Button
      startContent={<BiArrowBack />}
      variant="clear"
      size="xs"
      onPress={() => router.back()}
    >
      Back
    </Button>
  )
}
