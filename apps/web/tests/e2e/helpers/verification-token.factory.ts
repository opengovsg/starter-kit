import { db } from '@acme/db'

import { hashToken } from '~/server/modules/auth/token-hash'

export const setKnownOtp = async (email: string) => {
  const otp = 'ABCDEFGH'

  const { identifier } = await db.verificationToken.findFirstOrThrow({
    select: { identifier: true },
    where: {
      identifier: { startsWith: `${JSON.stringify([email]).slice(0, -1)},` },
    },
  })

  await db.verificationToken.update({
    data: { token: hashToken(otp, identifier) },
    where: { identifier },
  })

  return otp
}
