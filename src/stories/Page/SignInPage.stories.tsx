import type { Meta, StoryObj } from '@storybook/react'
import SignInPage from '~/pages/sign-in'

import { expect } from '@storybook/jest'
import { userEvent, within } from '@storybook/testing-library'
import { meHandlers } from 'tests/msw/handlers/me'
import { getMobileViewParameters } from '../utils/viewports'

const meta: Meta<typeof SignInPage> = {
  title: 'Pages/Sign In Page',
  component: SignInPage,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
    msw: {
      handlers: [meHandlers.unauthorized()],
    },
  },
}

export default meta
type Story = StoryObj<typeof SignInPage>

export const Default: Story = {}

export const WithSgidLogin: Story = {
  parameters: {
    features: {
      sgid: true,
    },
  },
}

export const Mobile: Story = {
  parameters: getMobileViewParameters(),
}

export const InputValidation: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Enter invalid email address', async () => {
      await userEvent.type(await canvas.findByLabelText(/email/i), 'test')
    })

    await step('Attempt log in', async () => {
      await userEvent.click(await canvas.findByText(/get otp/i))
      const error = await canvas.findByText(
        /please enter a valid email address/i
      )
      await expect(error).toBeInTheDocument()
    })
  },
}
