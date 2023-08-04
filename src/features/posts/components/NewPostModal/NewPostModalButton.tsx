import { useDisclosure } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import { NewPostModal } from './NewPostModal'
import { useFeatures } from '~/components/AppProviders'

export const NewPostModalButton = (): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { storage } = useFeatures()
  return (
    <>
      <Button size="xs" onClick={onOpen}>
        New post
      </Button>
      <NewPostModal
        allowImageUpload={storage}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  )
}
