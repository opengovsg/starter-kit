import { MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import { IconButton, Menu } from '@opengovsg/design-system-react'
import { BiDotsHorizontal } from 'react-icons/bi'
import { trpc } from '~/utils/trpc'

type FeedbackRole = 'owner' | 'viewer'

interface FeedbackRowMenuProps {
  role: FeedbackRole
  id: string
}

const FeedbackRowMenuItems = ({
  role,
  id,
}: FeedbackRowMenuProps): JSX.Element => {
  const utils = trpc.useContext()
  const deleteMutation = trpc.post.delete.useMutation({
    onSuccess: () => utils.post.list.invalidate(),
  })

  if (role === 'owner') {
    return (
      <MenuList>
        <MenuItem>Edit</MenuItem>
        <MenuItem
          disabled={deleteMutation.isLoading}
          onClick={() => deleteMutation.mutate({ id })}
        >
          Delete
        </MenuItem>
      </MenuList>
    )
  }
  return <MenuList />
}

export const FeedbackRowMenu = ({
  role,
  id,
}: FeedbackRowMenuProps): JSX.Element => {
  return (
    <Menu isLazy>
      <MenuButton
        variant="clear"
        colorScheme="neutral"
        as={IconButton}
        icon={<BiDotsHorizontal />}
      />
      <FeedbackRowMenuItems role={role} id={id} />
    </Menu>
  )
}
