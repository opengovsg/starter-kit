export const extractIpAddress = (headers: Headers): string | null => {
  const forwarded =
    headers.get('cf-connecting-ip') ??
    headers.get('x-forwarded-for') ??
    headers.get('x-real-ip')

  if (!forwarded) {
    return null
  }

  return forwarded.split(/, /)[0] ?? null
}
