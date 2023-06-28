import type { Meta, StoryObj } from '@storybook/react'
import { meHandlers } from 'tests/msw/handlers/me'
import { postHandlers } from 'tests/msw/handlers/post'

import HomePage from '~/pages/home'

const meta: Meta<typeof HomePage> = {
  title: 'Pages/Home Page',
  component: HomePage,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
    msw: {
      handlers: [meHandlers.me(), postHandlers.emptyList()],
    },
  },
}

export default meta
type Story = StoryObj<typeof HomePage>

export const EmptyPostList: Story = {}
