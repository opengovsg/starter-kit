import { env } from '~/env'

const hasWindow = () => 'window' in globalThis

/**
 * Retrieves the base URL for the current environment.
 */
export const getBaseUrl = () => {
  if (hasWindow()) {
    return globalThis.window.location.origin
  }
  if (env.NEXT_PUBLIC_APP_URL !== undefined && env.NEXT_PUBLIC_APP_URL !== '') {
    return env.NEXT_PUBLIC_APP_URL
  }
  // reference for vercel.com
  if (env.VERCEL_URL !== undefined && env.VERCEL_URL !== '') {
    return `https://${env.VERCEL_URL}`
  }
  // assume localhost
  return `http://localhost:${env.PORT}`
}
