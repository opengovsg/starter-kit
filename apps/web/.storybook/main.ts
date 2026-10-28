import { createRequire } from 'node:module'
import { dirname, join } from 'path'

import type { StorybookConfig } from '@storybook/nextjs-vite'

const require = createRequire(import.meta.url)

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')))
}
const config: StorybookConfig = {
  features: {
    experimentalRSC: true,
    componentsManifest: true,
    experimentalDocgenServer: true,
  },
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath('@storybook/addon-mcp'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/nextjs-vite'),
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
  async viteFinal(config) {
    // TailwindCSS is not being imported properly within Storybook, so we add the
    // TailwindCSS plugin to Vite directly here.
    const { default: tailwindcss } = await import('@tailwindcss/vite')
    const { mergeConfig } = await import('vite')
    return mergeConfig(config, { plugins: [tailwindcss()] })
  },
  staticDirs: ['../public'],
}
export default config
