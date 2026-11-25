import { TRPCError } from '@trpc/server'
import { add } from 'date-fns/add'
import { format } from 'date-fns/format'

import { db } from '@acme/db'

import { sendMail } from '../mail/mail.service'
import { createAuthToken } from './auth-token'
import { createVfnIdentifier, createVfnPrefix } from './vfn'

import { Prisma } from '@acme/db/client'
import { env } from '~/env'
import { getBaseUrl } from '~/utils/get-base-url'

export const emailLogin = async ({
  email,
  codeChallenge,
}: {
  email: string
  codeChallenge: string
}) => {
  const identifier = createVfnIdentifier({ codeChallenge, email })
  const { token, hashedToken } = createAuthToken({ codeChallenge, email })

  let issuedAt: Date

  try {
    ;({ issuedAt } = await db.verificationToken.create({
      data: {
        identifier,
        issuedAt: new Date(),
        token: hashedToken,
      },
      select: {
        issuedAt: true,
      },
    }))
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      // P2025 cant happen currently because there is no relation on verificationToken table
      // That means a duplicate code challenge was used with the same email
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Please refresh and try again.',
      })
    }

    throw error
  }

  const url = new URL(getBaseUrl())
  // for frontend display purposes: helps user to match OTP to session
  const otpPrefix = createVfnPrefix()
  const expiry = add(issuedAt, { seconds: env.OTP_EXPIRY })
  await sendMail({
    body: `Your OTP is ${otpPrefix}-<b>${token}</b>. It will expire on ${format(
      expiry,
      'dd MMM yyyy, h:mmaaa'
    )}.
      Please use this to login to your account.
      <p>If your OTP does not work, please request for a new one.</p>`,
    recipient: email,
    subject: `Sign in to ${url.host}`,
  })

  // return email if you want to send the OTP to a different email
  return {
    email,
    otpPrefix,
    token,
  }
}
