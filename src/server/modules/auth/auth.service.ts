import { type Prisma, type PrismaClient } from '@prisma/client'
import { VerificationError } from './auth.error'
import { compareHash } from './auth.util'

export const verifyToken = async (
  prisma: PrismaClient,
  { token, email }: { token: string; email: string }
) => {
  try {
    const verificationToken = await prisma.verificationToken.update({
      where: {
        identifier: email,
      },
      data: {
        attempts: {
          increment: 1,
        },
      },
    })

    if (verificationToken.attempts > 5) {
      throw new VerificationError('Too many attempts')
    }

    if (
      verificationToken.expires.valueOf() < Date.now() ||
      !compareHash(token, email, verificationToken.token)
    ) {
      throw new VerificationError('Token is invalid or has expired')
    }

    if (verificationToken.attempts > 5) {
      throw new VerificationError('Too many attempts')
    }

    await prisma.verificationToken.delete({
      where: {
        identifier: email,
      },
    })

    return
  } catch (error) {
    // see error code here: https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
    if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') {
      throw new VerificationError('Invalid login email')
    }
    throw error
  }
}
