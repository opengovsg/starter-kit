import { defineConfig } from 'oxlint'

export const e18e = defineConfig({
  jsPlugins: [{ name: 'e18e', specifier: '@e18e/eslint-plugin' }],
  rules: {
    'e18e/ban-dependencies': 'error',
    'e18e/no-delete-property': 'error',
    'e18e/no-spread-in-reduce': 'error',
    'e18e/prefer-array-fill': 'error',
    'e18e/prefer-array-from-map': 'error',
    'e18e/prefer-array-to-reversed': 'error',
    'e18e/prefer-array-to-sorted': 'error',
    'e18e/prefer-array-to-spliced': 'error',
    'e18e/prefer-charcode-at-in-loop': 'error',
    'e18e/prefer-get-or-insert': 'error',
    'e18e/prefer-includes-over-regex-test': 'error',
    'e18e/prefer-inline-equality': 'error',
    'e18e/prefer-slice-over-split-index': 'error',
    'e18e/prefer-static-collator': 'error',
    'e18e/prefer-static-regex': 'error',
    'e18e/prefer-throw-if-no-entry': 'error',
    'e18e/prefer-timer-args': 'error',
    'e18e/prefer-url-canparse': 'error',
  },
})
