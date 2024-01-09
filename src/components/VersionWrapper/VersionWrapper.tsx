import { useCallback, useEffect, useState } from 'react'
import { useDisclosure } from '@chakra-ui/react'

import { REQUIRE_UPDATE_EVENT } from '~/constants/version'
import { VersionBanner } from './VersionBanner'
import { VersionModal } from './VersionModal'

export const VersionWrapper = () => {
  const [requireUpdate, setRequireUpdate] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleRequireUpdateEvent = useCallback(() => {
    setRequireUpdate(true)
  }, [])

  useEffect(() => {
    window.addEventListener(REQUIRE_UPDATE_EVENT, handleRequireUpdateEvent)

    return () => {
      window.removeEventListener(REQUIRE_UPDATE_EVENT, handleRequireUpdateEvent)
    }
  }, [handleRequireUpdateEvent])

  useEffect(() => {
    requireUpdate && onOpen()
  }, [onOpen, requireUpdate])

  return (
    <>
      {requireUpdate && <VersionBanner />}
      <VersionModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
