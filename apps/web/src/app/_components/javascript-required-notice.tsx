import { env } from '~/env'

/**
 * When JavaScript is off, hides everything after it in the same parent and
 * shows this notice instead.
 */
export const JavaScriptRequiredNotice = () => (
  <noscript id="javascript-required-notice" className="m-auto p-4 text-center">
    <style>{'#javascript-required-notice ~ * { display: none; }'}</style>
    <p>
      {env.NEXT_PUBLIC_APP_NAME} requires JavaScript. Enable JavaScript in your
      browser settings, then reload this page.
    </p>
  </noscript>
)
