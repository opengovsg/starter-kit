import { createRequire } from 'node:module'
import { dirname, join } from 'path'

import type { StorybookConfig } from '@storybook/react-vite'

const require = createRequire(import.meta.url)

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')))
}
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-vitest'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  async viteFinal(config) {
    const { default: tailwindcss } = await import('@tailwindcss/vite')
    const { mergeConfig } = await import('vite')
    // TanStack Start plugins (pulled from vite.config.ts) conflict with
    // Storybook's multi-entry build under Rolldown (Vite 8). Storybook stories
    // only need React component context, not TanStack Start routing.
    const filteredConfig = {
      ...config,
      plugins: (config.plugins ?? [])
        .flat(Infinity as 1)
        .filter(
          (p: unknown) =>
            !p || !(p as { name?: string }).name?.startsWith('tanstack')
        ),
    }
    return mergeConfig(filteredConfig, { plugins: [tailwindcss()] })
  },
  staticDirs: ['../public'],
}
export default config
