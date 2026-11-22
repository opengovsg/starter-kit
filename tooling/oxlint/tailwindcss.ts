import { defineConfig } from 'oxlint'
import tailwindcssPreset from 'oxlint-tailwindcss/config'

/**
 * Tailwind CSS v4 lint via oxlint's JS plugin bridge.
 *
 * @see https://oxlint-tailwindcss.pages.dev/setup
 */
const tailwindcssRecommended = tailwindcssPreset()

/**
 * Recommended rules, plus design-system guards the preset leaves off.
 * Severity is `error` so violations fail lint while we see what they catch.
 * `no-default-palette` has no `allow` list yet — `white` will report.
 */
const tailwindcssRules = {
  ...tailwindcssRecommended.rules,
  'tailwindcss/no-default-palette': 'error',
  'tailwindcss/prefer-theme-tokens': 'error',
  'tailwindcss/prefer-scale-token': 'error',
} as const

/**
 * Extend from a `defineAcmeConfig` root, which hoists the settings.
 *
 * @param entryPoint - The design-system CSS, relative to the consuming `oxlint.config.ts`.
 */
export const tailwindcssOxlint = (entryPoint: string) =>
  defineConfig({
    jsPlugins: tailwindcssRecommended.jsPlugins,
    rules: tailwindcssRules,
    settings: { tailwindcss: { entryPoint, callees: ['cn', 'cva'] } },
  })
