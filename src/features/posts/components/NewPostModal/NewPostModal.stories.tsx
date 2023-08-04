import { useDisclosure } from '@chakra-ui/react'

import { NewPostModal } from './NewPostModal'
import { type Meta, type StoryObj } from '@storybook/react'
import { meHandlers } from 'tests/msw/handlers/me'

const meta: Meta<typeof NewPostModal> = {
  title: 'Features/Posts/NewPostModal',
  component: NewPostModal,
  parameters: {
    layout: 'fullscreen',
    // Prevent flaky tests due to modal animating in.
    chromatic: { pauseAnimationAtEnd: true },
    msw: {
      handlers: [meHandlers.me()],
    },
  },
}

export default meta
type Story = StoryObj<typeof NewPostModal>

const defaultRenderFn: Story['render'] = (args) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const modalProps = useDisclosure({ defaultIsOpen: true })

  return (
    <NewPostModal
      {...args}
      {...modalProps}
      onClose={() => console.log('close modal')}
    />
  )
}

export const NoImageUpload: Story = {
  render: defaultRenderFn,
}

export const WithImageUpload: Story = {
  args: {
    allowImageUpload: true,
  },
  render: defaultRenderFn,
}
