'use client'

import { useEffect, useState } from 'react'

import { Banner } from '@opengovsg/oui/banner'
import { Button } from '@opengovsg/oui/button'
import type { ModalProps } from '@opengovsg/oui/modal'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@opengovsg/oui/modal'

import { REQUIRE_UPDATE_EVENT } from '~/constants'

const VersionModal = (props: ModalProps) => (
  <Modal isDismissable={false} {...props}>
    <ModalContent>
      <ModalHeader className="flex flex-col gap-1">
        Update available
      </ModalHeader>
      <ModalBody>
        A new version of this app is available. Please refresh the page to get
        the latest version. You cannot make further changes until you refresh.
      </ModalBody>
      <ModalFooter>
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

/**
 * Banner and modal when `REQUIRE_UPDATE_EVENT` fires (version header mismatch).
 * tRPC writes are blocked via `version-sync` + the browser tRPC client until reload.
 */
export const VersionCheckWrapper = () => {
  const [requireUpdate, setRequireUpdate] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleRequireUpdateEvent = () => {
      setRequireUpdate(true)
      setIsOpen(true)
    }

    window.addEventListener(REQUIRE_UPDATE_EVENT, handleRequireUpdateEvent)

    return () => {
      window.removeEventListener(REQUIRE_UPDATE_EVENT, handleRequireUpdateEvent)
    }
  }, [])

  return (
    <>
      {requireUpdate && (
        <Banner variant="warning" isDismissable={false}>
          An update is available. Refresh the page to continue using the app.
        </Banner>
      )}
      <VersionModal isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
