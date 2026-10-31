import { scryptSync } from 'node:crypto'

import { db } from '@acme/db'

/**
 * The real OTP is only sent by email, so replace the stored hash for the
 * email's pending OTP with the hash of a known one. Call after requesting
 * the OTP; returns the OTP to type in.
 */
export const setKnownOtp = async (email: string) => {
  const otp = 'ABCDEFGH'

  // The identifier is JSON.stringify([email, codeChallenge]).
  const { identifier } = await db.verificationToken.findFirstOrThrow({
    select: { identifier: true },
    where: {
      identifier: { startsWith: `${JSON.stringify([email]).slice(0, -1)},` },
    },
  })

  await db.verificationToken.update({
    // Mirrors createTokenHash in src/server/modules/auth/auth.utils.ts (not
    // imported: it pulls in CJS deps Playwright's ESM loader can't resolve).
    data: { token: scryptSync(otp, identifier, 64).toString('base64') },
    where: { identifier },
  })

  return otp
}
