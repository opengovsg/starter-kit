import type { Meta, StoryObj } from '@storybook/react'

import LandingPage from '~/pages/index'
import { getMobileViewParameters } from '../utils/viewports'

const meta: Meta<typeof LandingPage> = {
  title: 'Pages/Landing Page',
  component: LandingPage,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof LandingPage>

export const Desktop: Story = {}

export const Mobile: Story = {
  parameters: getMobileViewParameters(),
}
