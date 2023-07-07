import { useDisclosure } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import { NewPostModal } from './NewPostModal'

export const NewPostModalButton = (): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button size="xs" onClick={onOpen}>
        New post
      </Button>
      <NewPostModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
