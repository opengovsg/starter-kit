import type { Meta, StoryObj } from '@storybook/react'
import SignInPage from '~/pages/sign-in'

const meta: Meta<typeof SignInPage> = {
  title: 'Pages/SignIn',
  component: SignInPage,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof SignInPage>

export const SignIn: Story = {}
