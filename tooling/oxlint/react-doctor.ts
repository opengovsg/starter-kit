import { jsPluginSettings, selectJsPlugins } from 'ultracite/oxlint/js-plugins'

/**
 * React Doctor via Oxlint's JS plugin bridge. Kept separate from the native
 * `react` preset so framework lint stays on Oxlint's fast Rust rules.
 *
 * @see https://www.ultracite.ai/docs/provider/oxlint#eslint-parity-optional
 */
export const reactDoctor = selectJsPlugins(['react-doctor'])

export { jsPluginSettings as reactDoctorSettings }
