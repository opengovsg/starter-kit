import { env } from '~/env.mjs'

/**
 * Retrieves the base URL for the current environment.
 * @note Server-only utility function.
 */
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  if (env.NEXT_PUBLIC_APP_URL) {
    return env.NEXT_PUBLIC_APP_URL
  }
  // reference for vercel.com
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`
}
