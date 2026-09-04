'use client'

import { useSyncExternalStore } from 'react'

import { useRouter } from 'next/navigation'

import { Button } from '@opengovsg/oui'

const subscribe = () => () => {
  // No external store subscription needed; history length is read on demand.
}

// window.history.length is always >= 1 (current entry); > 1 means there's a previous entry
const getCanGoBack = () => globalThis.window.history.length > 1

const getServerCanGoBack = () => false

export const GoBackButton = () => {
  const router = useRouter()

  const canGoBack = useSyncExternalStore(
    subscribe,
    getCanGoBack,
    getServerCanGoBack
  )

  if (!canGoBack) {
    return null
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <Button onPress={handleBack} color="neutral">
      Go Back
    </Button>
  )
}
