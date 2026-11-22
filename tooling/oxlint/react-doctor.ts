import { selectJsPlugins } from 'ultracite/oxlint/js-plugins'

/**
 * React Doctor via Oxlint's JS plugin bridge. Kept separate from the native
 * `react` preset so framework lint stays on Oxlint's fast Rust rules. Carries
 * its `settings`, so extend it from a `defineAcmeConfig` root.
 *
 * @see https://www.ultracite.ai/docs/provider/oxlint#eslint-parity-optional
 */
export const reactDoctor = selectJsPlugins(['react-doctor'])
