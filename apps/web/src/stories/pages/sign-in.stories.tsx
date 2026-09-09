import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor } from 'storybook/test'
import { AppDecorator } from '~storybook/decorators'
import { authHandlers } from '~tests/msw/handlers/auth'

import { withChromaticModes } from '@acme/storybook-config'

import { SignInPageComponent } from '~/app/(public)/sign-in/_components/_page'

const meta: Meta<typeof SignInPageComponent> = {
  component: SignInPageComponent,
  decorators: [AppDecorator],
  parameters: {
    ...withChromaticModes(['desktop', 'tablet', 'mobile']),
    layout: 'fullscreen',
    msw: {
      handlers: [authHandlers.signIn.success()],
    },
  },
  title: 'Pages/SignInPage',
}

export default meta
type Story = StoryObj<typeof meta>

export const LoginStep: Story = {}

export const LoginStepRequiredError: Story = {
  play: async ({ canvas, userEvent }) => {
    const submitButton = canvas.getByRole('button', { name: 'Get OTP' })
    await userEvent.click(submitButton)

    await expect(
      await canvas.findByText('Please enter an email address.')
    ).toBeInTheDocument()
  },
}

export const LoginStepLoading: Story = {
  parameters: {
    msw: {
      handlers: [authHandlers.signIn.loading()],
    },
  },
  play: async ({ canvas, userEvent }) => {
    const emailInput = canvas.getByLabelText(/log in/iu)
    const submitButton = canvas.getByRole('button', { name: 'Get OTP' })

    await userEvent.type(emailInput, 'example@gov.sg')
    await userEvent.click(submitButton)
  },
}

export const VerifyOtpStep: Story = {
  play: async ({ canvas, userEvent }) => {
    const emailInput = canvas.getByLabelText(/log in/iu)
    const submitButton = canvas.getByRole('button', { name: 'Get OTP' })

    await userEvent.type(emailInput, 'example@gov.sg')
    await userEvent.click(submitButton)
  },
}

export const VerifyOtpStepError: Story = {
  play: async ({ canvas, context, userEvent }) => {
    await VerifyOtpStep.play?.(context)
    await waitFor(async () => {
      const submitButton = canvas.getByRole('button', { name: 'Log in' })
      await userEvent.click(submitButton)
    })
  },
}
