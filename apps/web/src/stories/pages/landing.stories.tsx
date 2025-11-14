import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withChromaticModes } from '@acme/storybook-config'

import { LandingPageComponent } from '~/app/(public)/_components/landing-page/_page'

const meta: Meta<typeof LandingPageComponent> = {
  title: 'Pages/LandingPage',
  component: LandingPageComponent,
  decorators: [],
  parameters: {
    ...withChromaticModes(['desktop', 'tablet', 'mobile']),
  },
  args: {
    appName: 'Acme',
    isAuthed: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const LoggedIn: Story = {
  args: {
    isAuthed: true,
  },
}
