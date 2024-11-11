import type { Meta, StoryObj } from '@storybook/react'
import { meHandlers } from 'tests/msw/handlers/me'

import HomePage from '~/pages/home'

const meta: Meta<typeof HomePage> = {
  title: 'Pages/Home Page',
  component: HomePage,
  parameters: {
    mockdate: new Date('2023-06-28T07:23:18.349Z'),
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
    msw: {
      handlers: [meHandlers.me()],
    },
  },
}

export default meta
type Story = StoryObj<typeof HomePage>

export const Default: Story = {}
