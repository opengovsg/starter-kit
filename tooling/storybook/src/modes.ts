/**
 * This file is for Chromatic viewport modes.
 * @see https://www.chromatic.com/docs/modes/
 * The names should correspond to the viewports exported in `viewports.ts`.
 */

import type { ViewportKey } from './viewports'

export type ChromaticModeKey = 'mobile' | 'tablet' | 'desktop'

export const modes: Record<ChromaticModeKey, { viewport: ViewportKey }> = {
  mobile: {
    viewport: 'sm',
  },
  tablet: {
    viewport: 'md',
  },
  desktop: {
    viewport: 'xl',
  },
  // You can also combine modes by passing in the appropriate parameters
  // "dark desktop": {
  //   backgrounds: { value: "#1E293B" },
  //   theme: "dark",
  //   viewport: "lg",
  // },
}

// Mainly for typing available viewports for use in storybook
export const getViewportByMode = (viewport: ChromaticModeKey) => {
  return modes[viewport].viewport
}
