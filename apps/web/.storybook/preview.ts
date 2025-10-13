import type { Preview } from '@storybook/nextjs-vite'

import { viewport } from '@acme/storybook-config'

import { ibmPlexMono, inter } from '~/lib/fonts'

import '../src/app/globals.css'

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
        ibmPlexMono.variable,
        inter.variable,
        'text-base-content-default',
        'font-sans',
        'antialiased',
      )
      return Story()
    },
  ],
}

export default preview
