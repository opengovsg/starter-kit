import { Prisma, PrismaClient } from '@prisma/client';
import { createTokenHash } from './auth.utils';

export const useVerificationToken = async (
  prisma: PrismaClient,
  { token, email }: { token: string; email: string },
) => {
  try {
    const verificationToken = await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: createTokenHash(token),
        },
      },
    });
    return verificationToken;
  } catch (error) {
    // If token already used/deleted, just return null
    // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
    if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') {
      return null;
    }
    throw error;
  }
};
