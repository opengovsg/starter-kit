import { MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import { IconButton, Menu } from '@opengovsg/design-system-react'
import { useSetAtom } from 'jotai'
import { BiDotsHorizontal } from 'react-icons/bi'
import { type RouterOutput } from '~/utils/trpc'
import { actionStateAtom } from '../api/actionState'
import { type FeedbackRole } from '../api/types'

interface FeedbackRowMenuProps {
  role: FeedbackRole
  feedback: RouterOutput['post']['list']['items'][number]
}

const FeedbackRowMenuItems = ({
  role,
  feedback,
}: FeedbackRowMenuProps): JSX.Element => {
  const setState = useSetAtom(actionStateAtom)

  if (role === 'owner') {
    return (
      <MenuList>
        <MenuItem
          onClick={() => {
            setState({
              post: feedback,
              state: 'edit',
            })
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setState({
              post: feedback,
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

export const FeedbackRowMenu = (props: FeedbackRowMenuProps): JSX.Element => {
  return (
    <Menu isLazy>
      <MenuButton
        variant="clear"
        colorScheme="neutral"
        as={IconButton}
        icon={<BiDotsHorizontal />}
      />
      <FeedbackRowMenuItems {...props} />
    </Menu>
  )
}
