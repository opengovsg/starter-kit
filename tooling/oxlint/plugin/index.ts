import { eslintCompatPlugin } from '@oxlint/plugins'

import { requireExplicitUserColumnsRule } from './rules/require-explicit-user-columns.ts'

/**
 * Repo-specific Oxlint rules. Add a rule in `rules/<name>.ts` with a sibling
 * `<name>.test.ts`, register it here, then enable it in `../acme.ts`.
 *
 * @see https://github.com/dmmulroy/anti-slop
 */
export default eslintCompatPlugin({
  meta: { name: 'acme' },
  rules: {
    'require-explicit-user-columns': requireExplicitUserColumnsRule,
  },
})
