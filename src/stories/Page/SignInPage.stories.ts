import type { Meta, StoryObj } from '@storybook/react'
import SignInPage from '~/pages/sign-in'

import { within, userEvent } from '@storybook/testing-library'
import { expect } from '@storybook/jest'
import { TRPCError } from '@trpc/server'
import { getMobileViewParameters } from '../utils/viewports'
import { mockTrpcErrorResponse, trpcMsw } from '../utils/mockTrpc'

const meta: Meta<typeof SignInPage> = {
  title: 'Pages/Sign In Page',
  component: SignInPage,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
    msw: {
      handlers: [
        trpcMsw.me.get.query((_req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json(
              mockTrpcErrorResponse(new TRPCError({ code: 'UNAUTHORIZED' }))
            )
          )
        }),
      ],
    },
  },
}

export default meta
type Story = StoryObj<typeof SignInPage>

export const Default: Story = {}

export const Mobile: Story = {
  parameters: getMobileViewParameters(),
}

export const InputValidation: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Enter invalid email address', async () => {
      userEvent.type(await canvas.findByLabelText(/email/i), 'test')
    })

    await step('Attempt log in', async () => {
      userEvent.click(await canvas.findByText(/get otp/i))
      expect(await canvas.findByText(/email address/i)).toBeInTheDocument()
    })
  },
}
