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
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const getNextAuthBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '';
  }
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  return getBaseUrl();
};
