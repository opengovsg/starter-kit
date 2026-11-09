import { defineConfig } from 'oxlint'
import tailwindcss from 'oxlint-tailwindcss/config'

/**
 * Tailwind CSS v4 lint via oxlint's JS plugin bridge. Settings (entryPoint) live
 * in each consumer's oxlint.config.ts — oxlint does not inherit settings from extends.
 *
 * @see https://oxlint-tailwindcss.pages.dev/setup
 */
const tailwindcssRecommended = tailwindcss()

/**
 * Recommended rules, plus design-system guards the preset leaves off.
 * Severity is `error` so violations fail lint while we see what they catch.
 * `no-default-palette` has no `allow` list yet — `white` will report.
 *
 * The plugin types `rules` as `Record<string, 'error' | 'warn'>`. Spreading
 * that map infers the overrides as `string`, which `OxlintConfig` rejects.
 */
const tailwindcssRules: Record<string, 'error' | 'warn'> = {
  ...tailwindcssRecommended.rules,
  'tailwindcss/no-default-palette': 'error',
  'tailwindcss/prefer-theme-tokens': 'error',
  'tailwindcss/prefer-scale-token': 'error',
}

export const tailwindcssOxlint = defineConfig({
  jsPlugins: tailwindcssRecommended.jsPlugins,
  rules: tailwindcssRules,
})

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
