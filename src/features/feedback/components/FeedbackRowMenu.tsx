import { MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import { IconButton, Menu } from '@opengovsg/design-system-react'
import { useSetAtom } from 'jotai'
import { BiDotsHorizontal } from 'react-icons/bi'
import { actionStateAtom } from '../api/actionState'
import { FeedbackRole } from '../api/types'

interface FeedbackRowMenuProps {
  role: FeedbackRole
  id: string
}

const FeedbackRowMenuItems = ({
  role,
  id,
}: FeedbackRowMenuProps): JSX.Element => {
  const setState = useSetAtom(actionStateAtom)

  if (role === 'owner') {
    return (
      <MenuList>
        <MenuItem
          onClick={() => {
            setState({
              postId: id,
              state: 'edit',
            })
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setState({
              postId: id,
              state: 'delete',
            })
          }}
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
