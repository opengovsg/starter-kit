import { useDisclosure } from '@chakra-ui/react'
import { IconButton } from '@opengovsg/design-system-react'
import { type MouseEventHandler } from 'react'
import { BiTrash } from 'react-icons/bi'
import { type RouterOutput } from '~/utils/trpc'
import { DeletePostModal } from '../DeletePostModal'

interface DeletePostActionProps {
  postId: RouterOutput['post']['byUser']['posts'][number]['id']
}
export const DeletePostAction = ({
  postId,
}: DeletePostActionProps): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleOpenModal: MouseEventHandler = (e) => {
    e.stopPropagation()
    onOpen()
  }

  return (
    <>
      <IconButton
        data-value="post-action"
        colorScheme="critical"
        onClick={handleOpenModal}
        aria-label="Delete post"
        icon={<BiTrash fontSize="1.25rem" />}
      />
      <DeletePostModal postId={postId} isOpen={isOpen} onClose={onClose} />
    </>
  )
}
