import { type PrismaClient } from '@prisma/client'
import { generateUsername } from '../../me/me.service'
import { createPocdexAccountProviderId } from '../auth.util'
import { type SgidSessionProfile } from './sgid.utils'
import { AccountProvider } from '../auth.constants'

export const upsertSgidAccountAndUser = async ({
  prisma,
  pocdexEmail,
  name,
  sub,
}: {
  prisma: PrismaClient
  pocdexEmail: NonNullable<SgidSessionProfile['list'][number]['work_email']>
  name: SgidSessionProfile['name']
  sub: SgidSessionProfile['sub']
}) => {
  return await prisma.$transaction(async (tx) => {
    // Create user from email
    const user = await tx.user.upsert({
      where: {
        email: pocdexEmail,
      },
      update: {},
      create: {
        email: pocdexEmail,
        emailVerified: new Date(),
        name,
        username: generateUsername(pocdexEmail),
      },
    })

    // Backwards compatibility -- update username if it is not set
    if (!user.username) {
      await tx.user.update({
        where: { id: user.id },
        data: { username: generateUsername(pocdexEmail) },
      })
    }

    // Link user to account
    const pocdexProviderAccountId = createPocdexAccountProviderId(
      sub,
      pocdexEmail,
    )
    await tx.accounts.upsert({
      where: {
        provider_providerAccountId: {
          provider: AccountProvider.SgidPocdex,
          providerAccountId: pocdexProviderAccountId,
        },
      },
      update: {},
      create: {
        provider: AccountProvider.SgidPocdex,
        providerAccountId: pocdexProviderAccountId,
        userId: user.id,
      },
    })

    return user
  })
}
