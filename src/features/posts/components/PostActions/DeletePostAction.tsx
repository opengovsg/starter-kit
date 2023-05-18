import { useDisclosure } from '@chakra-ui/react'
import { IconButton } from '@opengovsg/design-system-react'
import { BiTrash } from 'react-icons/bi'
import { DeletePostModal } from '../DeletePostModal'

export const DeletePostAction = (): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <IconButton
        colorScheme="critical"
        onClick={onOpen}
        aria-label="Delete post"
        icon={<BiTrash fontSize="1.25rem" />}
      />
      <DeletePostModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
