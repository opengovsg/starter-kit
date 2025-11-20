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

const createTokenHash = ({
  token,
  email,
  nonce,
}: {
  token: string
  email: string
  nonce: string
}) => {
  return scryptSync(`${nonce}${token}`, email, 64).toString('base64')
}

export const isValidToken = ({
  token,
  email,
  hash,
  nonce,
}: {
  token: string
  email: string
  hash: string
  nonce: string
}) => {
  return timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(createTokenHash({ token, email, nonce })),
  )
}

export const createAuthToken = ({
  email,
  nonce,
}: {
  email: string
  nonce: string
}) => {
  const token = createVfnToken()
  const hashedToken = createTokenHash({ token, email, nonce })

  return {
    token,
    hashedToken,
  }
}
