/**
 * Storybook lint via Oxlint's JS plugin bridge. Ultracite has no Storybook
 * preset. Consumed only from the apps/web stories / `.storybook/main` overrides.
 *
 * Recommended (eslint-plugin-storybook 10.6.8) at **error**; the
 * plugin ships `hierarchy-separator`, `no-redundant-story-name`, and
 * `prefer-pascal-case` as warn. Oxlint override globs use `{ts,tsx}` braces —
 * `@(ts|tsx)` is silently ignored.
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

export const storybookStoriesRules = {
  'storybook/await-interactions': 'error',
  'storybook/context-in-play-function': 'error',
  'storybook/default-exports': 'error',
  'storybook/hierarchy-separator': 'error',
  'storybook/no-redundant-story-name': 'error',
  'storybook/no-renderer-packages': 'error',
  'storybook/prefer-pascal-case': 'error',
  'storybook/story-exports': 'error',
  'storybook/use-storybook-expect': 'error',
  'storybook/use-storybook-testing-library': 'error',
} as const

export const storybookMainRules = {
  'storybook/no-uninstalled-addons': 'error',
} as const
