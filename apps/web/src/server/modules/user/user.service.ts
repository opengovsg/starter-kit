import { parseOneAddress } from 'email-addresses'

import { db } from '@acme/db'

import { AccountProvider } from '../auth/auth.constants'
import { defaultUserSelect } from './user.select'

export const upsertUserAndAccountByEmail = async (email: string) => {
  const parsedEmail = parseOneAddress(email)
  if (!parsedEmail || parsedEmail.type === 'group') {
    throw new Error('Invalid email address')
  }

  return await db.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: parsedEmail.name,
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
