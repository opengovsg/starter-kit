import tailwindcss from 'oxlint-tailwindcss/config'

/**
 * Tailwind CSS v4 lint via oxlint's JS plugin bridge. Settings (entryPoint) live
 * in each consumer's oxlint.config.ts — oxlint does not inherit settings from extends.
 *
 * @see https://oxlint-tailwindcss.pages.dev/setup
 */
export const tailwindcssOxlint = tailwindcss()

/** Design-system entry for `apps/web` (paths relative to that oxlint config). */
export const tailwindcssWebSettings = {
  tailwindcss: {
    entryPoint: 'src/app/globals.css',
    callees: ['cn', 'cva'],
  },
} as const

/** `packages/ui` shares the web Tailwind entry (@source in globals.css). */
export const tailwindcssUiSettings = {
  tailwindcss: {
    entryPoint: '../../apps/web/src/app/globals.css',
    callees: ['cn', 'cva'],
  },
} as const
