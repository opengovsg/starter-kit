import { scryptSync, timingSafeEqual } from 'crypto'
import { customAlphabet } from 'nanoid'

import { OTP_LENGTH, OTP_PREFIX_LENGTH } from '~/validators/auth'

// Alphabet space with ambiguous characters removed.
const OTP_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const OTP_PREFIX_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ'

const createVfnToken = customAlphabet(OTP_ALPHABET, OTP_LENGTH)

export const createVfnPrefix = customAlphabet(
  OTP_PREFIX_ALPHABET,
  OTP_PREFIX_LENGTH,
)

const createTokenHash = (token: string, email: string) => {
  return scryptSync(token, email, 64).toString('base64')
}

export const isValidToken = ({
  token,
  email,
  hash,
}: {
  token: string
  email: string
  hash: string
}) => {
  return timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(createTokenHash(token, email)),
  )
}

export const createAuthToken = (email: string) => {
  const token = createVfnToken()
  const hashedToken = createTokenHash(token, email)

  return {
    token,
    hashedToken,
  }
}
