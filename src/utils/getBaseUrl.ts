/**
 * Retrieves the base URL for the current environment.
 * @note Server-only utility function.
 */
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '';
  }
  // reference for vercel.com
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // assume localhost
  return `http://127.0.0.1:${process.env.PORT ?? 3000}`;
};
