export const ACCEPTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

export type AcceptedImageFileTypes = (typeof ACCEPTED_FILE_TYPES)[number]
