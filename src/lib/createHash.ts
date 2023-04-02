/** Web compatible method to create a hash, using SHA256 */
export const createHash = async (message: string) => {
  const data = new TextEncoder().encode(message)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toString()
}
