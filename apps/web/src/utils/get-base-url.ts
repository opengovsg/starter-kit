import { env } from '~/env'

/**
 * Retrieves the base URL for the current environment.
 */
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  if (env.VITE_APP_URL) {
    return env.VITE_APP_URL
  }
  // reference for vercel.com
  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`
  }
  // assume localhost
  return `http://localhost:${env.PORT}`
}
