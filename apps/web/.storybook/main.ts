import { createRequire } from 'node:module'
import path from 'node:path'

import type { StorybookConfig } from '@storybook/nextjs-vite'

const require = createRequire(import.meta.url)

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
const getAbsolutePath = (value: string): string =>
  path.dirname(require.resolve(path.join(value, 'package.json')))

const config: StorybookConfig = {
  addons: [
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-vitest'),
  ],
  features: {
    experimentalRSC: true,
  },
  framework: {
    name: getAbsolutePath('@storybook/nextjs-vite'),
    options: {},
  },
  staticDirs: ['../public'],
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  async viteFinal(viteConfig) {
    // TailwindCSS is not being imported properly within Storybook, so we add the
    // TailwindCSS plugin to Vite directly here.
    const { default: tailwindcss } = await import('@tailwindcss/vite')
    const { mergeConfig } = await import('vite')
    return mergeConfig(viteConfig, { plugins: [tailwindcss()] })
  },
}
export default config
