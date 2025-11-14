/**
 * This file holds the viewports for Storybook rendering, and also for
 * Choromatic to take snapshots based on the given mode.
 * @see https://www.chromatic.com/docs/modes/ and the `modes.ts` file.
 *
 * Width breakpoints are set as OGPDS defaults (as of writing this ) of
 *
 * sm: '30em',
 * md: '48em',
 * lg: '64em',
 * xl: '90em',
 *
 * @see https://tailwindcss.com/docs/screens
 *
 * If you override default tailwindcss breakpoints, you should update this file
 * so snapshot widths are consistent with the breakpoints in your app.
 */

/** Type that conform to what Storybook expects for the `viewport` parameter */
interface StorybookViewportParameter {
  viewports: Record<
    string,
    {
      name: string
    } & (
      | {
          styles: {
            width: string
            height?: string
          }
        }
      | number
    )
  >
}

/**
 * The names of the viewports should correspond to the `viewport` parameter you
 * set in `modes.ts`.
 *
 * An additional `xs` viewport is added (outside of tailwindcss breakpoints)
 * specifically for Chromatic to have a snapshot for the smallest screen size.
 */
export const viewport = {
  viewports: {
    xs: { name: 'xs', styles: { width: '320px', height: '100%' } },
    sm: { name: 'sm', styles: { width: '480px', height: '100%' } },
    md: { name: 'md', styles: { width: '768px', height: '100%' } },
    lg: { name: 'lg', styles: { width: '1280px', height: '100%' } },
    xl: { name: 'xl', styles: { width: '1440px', height: '100%' } },
    '2xl': { name: '2xl', styles: { width: '1536px', height: '100%' } },
  },
} as const satisfies StorybookViewportParameter

export type ViewportKey = keyof typeof viewport.viewports
