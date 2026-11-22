import { configs } from 'eslint-plugin-storybook'

import { pluginRulesAtError } from '@acme/oxlint-config/plugin-rules.ts'

const storybookJsPlugins = [
  { name: 'storybook', specifier: 'eslint-plugin-storybook' },
]

const toOxlintGlob = (pattern: string): string =>
  pattern.replace(
    /@\(([^)]+)\)/g,
    (_match, alts: string) => `{${alts.replaceAll('|', ',')}}`
  )

export const storybookOverrides = configs.recommended.overrides
  .map((override) => ({
    files: override.files.map(toOxlintGlob),
    jsPlugins: [...storybookJsPlugins],
    rules: pluginRulesAtError('storybook/', override.rules),
  }))
  .filter((override) => Object.keys(override.rules).length > 0)

if (storybookOverrides.length === 0) {
  throw new Error(
    'eslint-plugin-storybook recommended produced no storybook/* rules'
  )
}
