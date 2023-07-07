import { useDisclosure } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import { NewPostModal } from './NewPostModal'
import { env } from '~/env.mjs'

const CAN_UPLOAD = !!env.NEXT_PUBLIC_ENABLE_STORAGE

export const NewPostModalButton = (): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button size="xs" onClick={onOpen}>
        New post
      </Button>
      <NewPostModal
        allowImageUpload={CAN_UPLOAD}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  )
}
