import { configs } from 'eslint-plugin-storybook'

/**
 * Storybook lint via Oxlint's JS plugin bridge. Ultracite has no Storybook
 * preset. Consumed only from the apps/web stories / `.storybook/main` overrides.
 *
 * `configs.recommended` has no top-level `rules` (eslintrc overrides). Every
 * `storybook/*` key is set to **error** (plugin ships a few as warn). Filter
 * to `storybook/` so recommended's `react-hooks/rules-of-hooks: off` and
 * `import-x/no-anonymous-default-export: off` are not flipped to error.
 * Oxlint override globs use `{ts,tsx}` braces — `@(ts|tsx)` is silently
 * ignored.
 *
 * Skipped vs csf / csf-strict / unconfigured:
 * - `csf-component`: kit already sets `component` on page stories.
 * - `no-title-property-in-meta`: kit uses explicit `title: 'Pages/…'`.
 * - `meta-satisfies-type`: kit uses `const meta: Meta<typeof …>`.
 * - `no-stories-of` / `meta-inline-properties`: no hits; keep recommended.
 *
 * @see https://github.com/storybookjs/storybook/tree/next/code/lib/eslint-plugin
 */
export const storybookJsPlugins = [
  { name: 'storybook', specifier: 'eslint-plugin-storybook' },
]

const storybookRulesAtError = (
  rules: Record<string, unknown>
): Record<string, 'error'> =>
  Object.fromEntries(
    Object.keys(rules)
      .filter((rule) => rule.startsWith('storybook/'))
      .map((rule) => [rule, 'error'] as const)
  )

const recommendedRulesFor = (fileNeedle: string): Record<string, unknown> => {
  const override = configs.recommended.overrides.find((item) =>
    item.files.some((pattern) => pattern.includes(fileNeedle))
  )
  if (!override) {
    throw new Error(
      `eslint-plugin-storybook recommended is missing files matching ${fileNeedle}`
    )
  }
  return override.rules
}

export const storybookStoriesRules = storybookRulesAtError(
  recommendedRulesFor('.stories.')
)
export const storybookMainRules = storybookRulesAtError(
  recommendedRulesFor('.storybook/main')
)
