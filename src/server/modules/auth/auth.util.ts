import { customAlphabet } from 'nanoid'
import { scryptSync, timingSafeEqual } from 'node:crypto'
import {
  OTP_ALPHABET,
  OTP_LENGTH,
  OTP_PREFIX_ALPHABET,
  OTP_PREFIX_LENGTH,
} from '~/lib/auth'

export const createVfnToken = customAlphabet(OTP_ALPHABET, OTP_LENGTH)

export const createVfnPrefix = customAlphabet(
  OTP_PREFIX_ALPHABET,
  OTP_PREFIX_LENGTH
)

export const createTokenHash = (token: string, email: string) => {
  return scryptSync(token, email, 64).toString('base64')
}

export const compareHash = (token: string, email: string, hash: string) => {
  return timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(createTokenHash(token, email))
  )
}
