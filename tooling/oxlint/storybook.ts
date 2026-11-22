import { configs } from 'eslint-plugin-storybook'

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
): Record<string, 'error'> => ({
  ...Object.fromEntries(
    Object.keys(rules)
      .filter((rule) => rule.startsWith('storybook/'))
      .map((rule) => [rule, 'error'] as const)
  ),
  'storybook/no-stories-of': 'error',
})

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
