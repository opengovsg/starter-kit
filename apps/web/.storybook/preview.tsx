import { RouterContextProvider } from '@tanstack/react-router'

import type { Preview } from '@storybook/react-vite'
import { initialize, mswLoader } from 'msw-storybook-addon'

import { viewport } from '@acme/storybook-config'

import { storybookRouter } from './decorators'

import '../src/app/globals.css'

// Initialize MSW
initialize({
  onUnhandledRequest: 'bypass',
})

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    viewport,
    chromatic: {
      prefersReducedMotion: 'reduce',
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => {
      // Apply the same font classes as the main app
      document.documentElement.classList.add(
        'text-base-content-default',
        'font-sans',
        'antialiased'
      )
      return (
        <RouterContextProvider router={storybookRouter}>
          <Story />
        </RouterContextProvider>
      )
    },
  ],
  loaders: [mswLoader],
}

export default preview
