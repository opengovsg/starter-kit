'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Button } from '@opengovsg/oui'

export const GoBackButton = () => {
  const router = useRouter()

  // window.history.length is always >= 1 (current entry); > 1 means there's a
  // previous entry. Read it in an effect so the component is SSR-safe: it can
  // then be imported directly from Server Components (error pages).
  const [canGoBack, setCanGoBack] = useState(false)
  useEffect(() => {
    setCanGoBack(window.history.length > 1)
  }, [])

  if (!canGoBack) return null

  const handleBack = () => {
    router.back()
  }

  return (
    <Button onPress={handleBack} color="neutral">
      Go Back
    </Button>
  )
}
