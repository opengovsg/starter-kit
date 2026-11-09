const FORWARDED_FOR_SEPARATOR = /, /u

export const extractIpAddress = (headers: Headers): string | null => {
  const forwarded =
    headers.get('cf-connecting-ip') ??
    headers.get('x-forwarded-for') ??
    headers.get('x-real-ip')

  if (forwarded === null || forwarded === '') {
    return null
  }

  return forwarded.split(FORWARDED_FOR_SEPARATOR)[0] ?? null
}
