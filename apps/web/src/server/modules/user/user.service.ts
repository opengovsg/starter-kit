import { parseOneAddress } from 'email-addresses'

import type { Logger } from '@acme/logging'

import { db } from '@acme/db'

import { AccountProvider } from '../auth/auth.constants'
import { defaultUserSelect } from './user.select'

export const loginUserByEmail = async (email: string, logger?: Logger) => {
  const parsedEmail = parseOneAddress(email)
  if (!parsedEmail || parsedEmail.type === 'group') {
    throw new Error('Invalid email address')
  }

  const { loggedInUser, isNewUser } = await db.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({
      select: { id: true },
      where: { email },
    })

    const transactionUser = await tx.user.upsert({
      create: {
        email,
        lastLogin: new Date(),
        name: parsedEmail.name,
      },
      select: defaultUserSelect,
      update: {
        lastLogin: new Date(),
      },
      where: { email },
    })

    await tx.account.upsert({
      create: {
        provider: AccountProvider.Email,
        providerAccountId: parsedEmail.address,
        userId: transactionUser.id,
      },
      update: {},
      where: {
        provider_providerAccountId: {
          provider: AccountProvider.Email,
          providerAccountId: parsedEmail.address,
        },
      },
    })
    // isNewUser is read at READ COMMITTED, so two concurrent first-ever logins
    // for the same email can both see "no user" and each emit accountCreated
    // once. Unreachable in the OTP flow (needs two valid OTPs submitted in the
    // same instant) and a duplicate audit line dedupes at the sink. If a flow
    // makes this reachable, take a pg advisory lock or use SERIALIZABLE + retry.
    return { isNewUser: !existing, loggedInUser: transactionUser }
  })

  // A first email login is a self-signup: the acting user is the account just
  // created, so bind user_id before emitting to attribute the actor (== target).
  if (isNewUser) {
    logger
      ?.withBindings({ userId: loggedInUser.id })
      .audit.userManagement.accountCreated({ targetUserId: loggedInUser.id })
  }

  return loggedInUser
}

export const getUserById = async (userId: string) => 
  await db.user.findUnique({
    select: defaultUserSelect,
    where: { id: userId },
  })

