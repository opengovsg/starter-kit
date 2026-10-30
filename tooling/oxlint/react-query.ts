import { defineConfig } from 'oxlint'
import tanstack from 'ultracite/oxlint/tanstack/js-plugins'

/**
 * React Doctor's TanStack Query rules. Extend alongside `reactDoctor`. The
 * upstream preset also ships `tanstack-start-*` rules, which target TanStack
 * Start routes and are dropped here.
 *
 * @see https://www.ultracite.ai/docs/provider/oxlint#eslint-parity-optional
 */
export default defineConfig({
  rules: Object.fromEntries(
    Object.entries(tanstack.rules ?? {}).filter(([rule]) =>
      rule.startsWith('react-doctor/query-')
    )
  ),
})
