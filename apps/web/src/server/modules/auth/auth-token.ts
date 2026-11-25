import { timingSafeEqual } from 'node:crypto'

import { hashToken } from './token-hash'
import { createVfnIdentifier, createVfnToken } from './vfn'

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
  const identifier = createVfnIdentifier({ codeChallenge, email })

  // in theory we should generate a unique salt per entry, but this is sufficient for OTPs
  return hashToken(token, identifier)
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
    const storedBuffer = Buffer.from(hash)

    const submittedBuffer = Buffer.from(
      createTokenHash({ codeChallenge, email, token })
    )

    if (storedBuffer.length !== submittedBuffer.length) {
      // Don't throw error on length mismatch to prevent timing attacks
      timingSafeEqual(submittedBuffer, submittedBuffer)

      return false
    }

    return timingSafeEqual(storedBuffer, submittedBuffer)
  } catch {
    // In case of any other error, return false
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
  const hashedToken = createTokenHash({ codeChallenge, email, token })

  return {
    hashedToken,
    token,
  }
}
