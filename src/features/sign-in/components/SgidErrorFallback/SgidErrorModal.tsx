import { useMemo } from 'react'
import Link from 'next/link'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react'

import { appendWithRedirect } from '~/utils/url'
import { SGID } from '~/lib/errors/auth.sgid'
import { SIGN_IN, type CallbackRoute } from '~/lib/routes'

interface SgidErrorModalProps {
  message: string
  redirectUrl: CallbackRoute
}

export const SgidErrorModal = ({
  message,
  redirectUrl,
}: SgidErrorModalProps) => {
  const { onClose } = useDisclosure()
  const modalSize = useBreakpointValue({
    base: 'mobile',
    md: 'md',
  })

  const modalText = useMemo(() => {
    switch (message) {
      case SGID.noPocdex:
        return {
          header: 'You do not have a valid government email address',
          body: 'You must be a government employee to sign in with Singpass. Please sign in using your email address instead.',
        }
      default:
        return {
          header: 'An unknown error has occurred',
          body: 'Please try logging in again.',
        }
    }
  }, [message])

  const backToLoginLink = useMemo(() => {
    return appendWithRedirect(SIGN_IN, redirectUrl)
  }, [redirectUrl])

  return (
    <Modal isOpen onClose={onClose} size={modalSize}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{modalText.header}</ModalHeader>
        <ModalBody>{modalText.body}</ModalBody>
        <ModalFooter>
          <Button as={Link} href={backToLoginLink}>
            Back to login
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
