import { parseOneAddress } from 'email-addresses'

import { db } from '@acme/db'

import { AccountProvider } from '../auth/auth.constants'
import { defaultUserSelect } from './user.select'

export const loginUserByEmail = async (email: string) => {
  const parsedEmail = parseOneAddress(email)
  if (!parsedEmail || parsedEmail.type === 'group') {
    throw new Error('Invalid email address')
  }

  return await db.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email },
      update: {
        lastLogin: new Date(),
      },
      create: {
        email,
        name: parsedEmail.name,
        lastLogin: new Date(),
      },
      select: defaultUserSelect,
    })

    await tx.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: AccountProvider.Email,
          providerAccountId: parsedEmail.address,
        },
      },
      update: {},
      create: {
        provider: AccountProvider.Email,
        providerAccountId: parsedEmail.address,
        userId: user.id,
      },
    })
    return user
  })
}

export const getUserById = async (userId: string) => {
  return await db.user.findUnique({
    where: { id: userId },
    select: defaultUserSelect,
  })
}
