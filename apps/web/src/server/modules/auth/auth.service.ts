import { add } from 'date-fns/add'
import { format } from 'date-fns/format'

import { db } from '@acme/db'

import { env } from '~/env'
import { getBaseUrl } from '~/utils/get-base-url'
import { sendMail } from '../mail/mail.service'
import { createAuthToken, createVfnPrefix } from './auth.utils'

export const emailLogin = async (email: string) => {
  const { token, hashedToken } = createAuthToken(email)
  const otpPrefix = createVfnPrefix()

  const url = new URL(getBaseUrl())

  const { issuedAt } = await db.verificationToken.upsert({
    where: {
      identifier: email,
    },
    update: {
      token: hashedToken,
      attempts: 0,
    },
    create: {
      identifier: email,
      token: hashedToken,
    },
    select: {
      issuedAt: true,
    },
  })

  const expiry = add(issuedAt, { seconds: env.OTP_EXPIRY })
  await sendMail({
    subject: `Sign in to ${url.host}`,
    body: `Your OTP is ${otpPrefix}-<b>${token}</b>. It will expire on ${format(
      expiry,
      'dd MMM yyyy, h:mmaaa',
    )}.
      Please use this to login to your account.
      <p>If your OTP does not work, please request for a new one.</p>`,
    recipient: email,
  })

  return {
    email,
    otpPrefix,
  }
}
