import { Box } from '@chakra-ui/react'
import { type Meta, type StoryObj } from '@storybook/react'

import { getMobileViewParameters } from '../utils/viewports'
import { VersionModal } from '~/components/VersionWrapper/VersionModal'

const meta: Meta<typeof VersionModal> = {
  title: 'Components/Version Modal',
  component: VersionModal,
  // Required for Chromatic to know the dimensions of the snapshot to take,
  // since the modal is rendered in a portal and Chromatic only detects the
  // bounding box of the button that opens the modal.
  decorators: [
    (storyFn) => (
      <Box w="100vw" h="100vh">
        {storyFn()}
      </Box>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    // Prevent flaky tests due to modal animating in.
    chromatic: { delay: 200 },
  },
  args: {
    isOpen: true,
    onClose: () => console.log('close'),
  },
}

export default meta

type Story = StoryObj<typeof VersionModal>

export const Default: Story = {}
export const Mobile: Story = {
  parameters: getMobileViewParameters(),
}
