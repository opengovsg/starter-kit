import { defineConfig } from 'oxlint'
import tanstack from 'ultracite/oxlint/tanstack/js-plugins'

export default defineConfig({
  rules: Object.fromEntries(
    Object.entries(tanstack.rules).filter(([rule]) =>
      rule.startsWith('react-doctor/query-')
    )
  ),
})
