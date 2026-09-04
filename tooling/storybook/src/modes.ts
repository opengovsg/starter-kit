/**
 * This file is for Chromatic viewport modes.
 * @see https://www.chromatic.com/docs/modes/
 * The names should correspond to the viewports exported in `viewports.ts`.
 */

import type { ViewportKey } from './viewports'

export type ChromaticModeKey = 'mobile' | 'tablet' | 'desktop'

export const modes = {
  desktop: {
    viewport: 'xl',
  },
  mobile: {
    viewport: 'sm',
  },
  tablet: {
    viewport: 'md',
  },
  // You can also combine modes by passing in the appropriate parameters
  // "dark desktop": {
  //   backgrounds: { value: "#1E293B" },
  //   theme: "dark",
  //   viewport: "lg",
  // },
} as const satisfies Record<ChromaticModeKey, { viewport: ViewportKey }>

// Mainly for typing available viewports for use in storybook
export const getViewportByMode = (viewport: ChromaticModeKey) =>
  modes[viewport].viewport
