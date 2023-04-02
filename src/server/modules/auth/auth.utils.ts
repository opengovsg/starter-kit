import { scryptSync, randomInt, timingSafeEqual } from 'node:crypto'

export const createVfnToken = () => {
  return randomInt(0, 1000000).toString().padStart(6, '0')
}

export const createTokenHash = (token: string, email: string) => {
  return scryptSync(token, email, 64).toString('base64')
}

export const compareHash = (token: string, email: string, hash: string) => {
  return timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(createTokenHash(token, email))
  )
}
