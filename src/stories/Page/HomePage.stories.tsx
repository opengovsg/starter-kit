import type { Meta, StoryObj } from '@storybook/react'
import { meHandlers } from 'tests/msw/handlers/me'

import HomePage from '~/pages/home'
import { withChromaticModes } from '../utils/chromatic'

const meta: Meta<typeof HomePage> = {
  title: 'Pages/Home Page',
  component: HomePage,
  parameters: {
    getLayout: HomePage.getLayout,
    mockdate: new Date('2023-06-28T07:23:18.349Z'),
    msw: {
      handlers: [meHandlers.me()],
    },
    chromatic: withChromaticModes(['mobile', 'desktop']),
  },
}

export default meta
type Story = StoryObj<typeof HomePage>

export const Default: Story = {
  name: 'Home Page',
}
