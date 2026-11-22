import { defineConfig } from 'oxlint'
import tailwindcssPreset from 'oxlint-tailwindcss/config'

const tailwindcssRecommended = tailwindcssPreset()

const tailwindcssRules = {
  ...tailwindcssRecommended.rules,
  'tailwindcss/no-default-palette': 'error',
  'tailwindcss/prefer-theme-tokens': 'error',
  'tailwindcss/prefer-scale-token': 'error',
} as const

export const tailwindcssOxlint = (entryPoint: string) =>
  defineConfig({
    jsPlugins: tailwindcssRecommended.jsPlugins,
    rules: tailwindcssRules,
    settings: { tailwindcss: { entryPoint, callees: ['cn', 'cva'] } },
  })
