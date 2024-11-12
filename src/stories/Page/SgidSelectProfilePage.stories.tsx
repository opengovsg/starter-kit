import type { Meta, StoryObj } from '@storybook/react'

import { authSgidHandlers } from '~tests/msw/handlers/auth/sgid'

import SelectProfilePage from '~/pages/sign-in/select-profile'
import { withChromaticModes } from '../utils/chromatic'

const meta: Meta<typeof SelectProfilePage> = {
  title: 'Pages/sgID Select Profile Page',
  component: SelectProfilePage,
  decorators: [],
  parameters: {
    chromatic: withChromaticModes(['mobile', 'desktop']),
    msw: {
      handlers: [authSgidHandlers.listStoredProfiles.returnSingleProfile()],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const MultipleProfiles: Story = {
  parameters: {
    msw: {
      handlers: [authSgidHandlers.listStoredProfiles.returnMultipleProfiles()],
    },
  },
}

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [authSgidHandlers.listStoredProfiles.loading()],
    },
  },
}
