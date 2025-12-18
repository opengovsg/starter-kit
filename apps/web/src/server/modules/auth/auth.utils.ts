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

export const createVfnIdentifier = ({
  email,
  codeChallenge,
}: {
  email: string
  codeChallenge: string
}) => {
  // Use a JSON stringified array to avoid ambiguity, avoids string concatenation issues
  return JSON.stringify([email, codeChallenge])
}

const createTokenHash = ({
  token,
  email,
  codeChallenge,
}: {
  token: string
  email: string
  codeChallenge: string
}) => {
  // email and codeChallenge are not private values, so we use them as a salt
  const identifier = createVfnIdentifier({ email, codeChallenge })
  // in theory we should generate a unique salt per entry, but this is sufficient for OTPs
  return scryptSync(token, identifier, 64).toString('base64')
}

// extracted for testing
export const isValidToken = ({
  token,
  email,
  hash,
  codeChallenge,
}: {
  token: string
  email: string
  hash: string
  codeChallenge: string
}) => {
  try {
    return timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(createTokenHash({ token, email, codeChallenge })),
    )
  } catch {
    // In case of any error (e.g. buffer size mismatch), return false
    return false
  }
}

// extracted for testing
export const createAuthToken = ({
  email,
  codeChallenge,
}: {
  email: string
  codeChallenge: string
}) => {
  const token = createVfnToken()
  const hashedToken = createTokenHash({ token, email, codeChallenge })

  return {
    token,
    hashedToken,
  }
}
