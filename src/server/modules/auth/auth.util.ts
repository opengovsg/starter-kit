import { customAlphabet } from 'nanoid'
import { scryptSync, timingSafeEqual } from 'node:crypto'
import {
  OTP_ALPHABET,
  OTP_LENGTH,
  OTP_PREFIX_ALPHABET,
  OTP_PREFIX_LENGTH,
} from '~/lib/auth'
import { normaliseEmail } from '~/utils/zod'

export const createVfnToken = customAlphabet(OTP_ALPHABET, OTP_LENGTH)

export const createVfnPrefix = customAlphabet(
  OTP_PREFIX_ALPHABET,
  OTP_PREFIX_LENGTH,
)

export const createTokenHash = (token: string, email: string) => {
  return scryptSync(token, email, 64).toString('base64')
}

export const compareHash = (token: string, email: string, hash: string) => {
  return timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(createTokenHash(token, email)),
  )
}

/**
 * Returns a provider ID for an account that is tied to a specific POCDEX email from sgID.
 * It will serve as a unique identifier for the specific POCDEX account, as a single sgID provider can return multiple POCDEX emails.
 * @param sgidSub The sgID sub returned from sgID
 * @param pocdexEmail The POCDEX email to tie the account to
 */
export const createPocdexAccountProviderId = (
  sgidSub: string,
  pocdexEmail: string,
) => {
  return `${sgidSub}-${normaliseEmail.parse(pocdexEmail)}`
}
