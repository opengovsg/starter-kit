/**
 * React Doctor's Next.js-specific rules. Extend alongside `reactDoctor`, not
 * the native `next` preset — these fire on generic JSX and would false-positive
 * outside Next.js apps.
 *
 * @see https://www.ultracite.ai/docs/provider/oxlint#eslint-parity-optional
 */
export { default } from 'ultracite/oxlint/next/js-plugins'
