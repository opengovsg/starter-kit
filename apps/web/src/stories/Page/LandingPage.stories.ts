import type { Meta, StoryObj } from '@storybook/react'

import LandingPage from '~/pages/index'
import { withChromaticModes } from '../utils/chromatic'

const meta: Meta<typeof LandingPage> = {
  title: 'Pages/Landing Page',
  component: LandingPage,
  parameters: {
    chromatic: withChromaticModes(['mobile', 'tablet', 'desktop']),
  },
}

export default meta
type Story = StoryObj<typeof LandingPage>

export const Default: Story = {
  name: 'Landing Page',
}
