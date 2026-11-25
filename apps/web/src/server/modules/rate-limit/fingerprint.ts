export const createRateLimitFingerprint = ({
  userId,
  ipAddress,
  path,
}: {
  userId: string | undefined
  ipAddress: string | null
  path: string
}) => {
  if (userId !== undefined && userId !== '') {
    return `userId:${userId}:${path}`
  }

  // Process IP address and replace colons so Redis keys stay compatible with the common
  // "namespace:subkey" convention and any tooling that treats ":" as a key separator.
  return `ip:${ipAddress?.replaceAll(':', '_') ?? 'unknown'}:${path}`
}
