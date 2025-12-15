'use client'

import type { ModalProps } from '@opengovsg/oui/modal'
import { useCallback, useEffect, useState } from 'react'
import { Banner } from '@opengovsg/oui/banner'
import { Button } from '@opengovsg/oui/button'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@opengovsg/oui/modal'

import { REQUIRE_UPDATE_EVENT } from '~/constants'

const VersionModal = (props: ModalProps) => {
  return (
    <Modal {...props}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Update available
        </ModalHeader>
        <ModalBody>
          A new version of this app is available. Please refresh the page to get
          the latest version.
        </ModalBody>
        <ModalFooter>
          <Button slot="close" color="neutral" variant="clear">
            Cancel
          </Button>
          <Button
            onPress={() => {
              window.location.reload()
            }}
          >
            Refresh
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

/**
 * Contains the version check banner and modal that will be shown when the
 * client receives a `REQUIRE_UPDATE_EVENT` event.
 */
export const VersionCheckWrapper = () => {
  const [requireUpdate, setRequireUpdate] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

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
    if (requireUpdate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true)
    }
  }, [requireUpdate])

  return (
    <>
      {requireUpdate && (
        <Banner variant="warning">
          An update is available. Please refresh the page.
        </Banner>
      )}
      <VersionModal isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
