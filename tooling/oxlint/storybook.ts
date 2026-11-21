import { configs } from 'eslint-plugin-storybook'

/**
 * Storybook lint via Oxlint's JS plugin bridge. Ultracite has no Storybook
 * preset. Overrides come from eslint-plugin-storybook `configs.recommended`;
 * every `storybook/*` rule is **error**. Oxlint ignores ESLint `@(ts|tsx)`
 * extglobs, so those become `{ts,tsx}`.
 *
 * @see https://github.com/storybookjs/storybook/tree/next/code/lib/eslint-plugin
 */
const storybookJsPlugins = [
  { name: 'storybook', specifier: 'eslint-plugin-storybook' },
]

const toOxlintGlob = (pattern: string): string =>
  pattern.replace(
    /@\(([^)]+)\)/g,
    (_match, alts: string) => `{${alts.replaceAll('|', ',')}}`
  )

const storybookRulesAtError = (
  rules: Record<string, unknown>
): Record<string, 'error'> =>
  Object.fromEntries(
    Object.keys(rules)
      .filter((rule) => rule.startsWith('storybook/'))
      .map((rule) => [rule, 'error'] as const)
  )

export const storybookOverrides = configs.recommended.overrides
  .map((override) => ({
    files: override.files.map(toOxlintGlob),
    jsPlugins: [...storybookJsPlugins],
    rules: storybookRulesAtError(override.rules),
  }))
  .filter((override) => Object.keys(override.rules).length > 0)

if (storybookOverrides.length === 0) {
  throw new Error(
    'eslint-plugin-storybook recommended produced no storybook/* rules'
  )
}
