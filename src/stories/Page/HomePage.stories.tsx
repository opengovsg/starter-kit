import type { Meta, StoryObj } from '@storybook/react'
import { meHandlers } from 'tests/msw/handlers/me'
import { postHandlers } from 'tests/msw/handlers/post'

import HomePage from '~/pages/home'
import { getMobileViewParameters } from '../utils/viewports'

const meta: Meta<typeof HomePage> = {
  title: 'Pages/Home Page',
  component: HomePage,
  parameters: {
    mockdate: new Date('2023-06-28T07:23:18.349Z'),
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

export const WithPosts: Story = {
  parameters: {
    msw: {
      handlers: [meHandlers.me(), postHandlers.list()],
    },
  },
}

export const MobileEmptyPostList: Story = {
  parameters: {
    ...EmptyPostList.parameters,
    ...getMobileViewParameters(),
  },
}

export const MobileWithPosts: Story = {
  parameters: {
    ...WithPosts.parameters,
    ...getMobileViewParameters(),
  },
}
