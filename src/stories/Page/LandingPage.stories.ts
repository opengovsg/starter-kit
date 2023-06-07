import type { Meta, StoryObj } from '@storybook/react'

import { TRPCError } from '@trpc/server'
import LandingPage from '~/pages/index'
import { getMobileViewParameters } from '../utils/viewports'
import { mockTrpcErrorResponse, trpcMsw } from '../__mocks__/trpc'

const meta: Meta<typeof LandingPage> = {
  title: 'Pages/Landing Page',
  component: LandingPage,
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
type Story = StoryObj<typeof LandingPage>

export const Desktop: Story = {}

export const Mobile: Story = {
  parameters: getMobileViewParameters(),
}
