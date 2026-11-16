import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { sealData } from 'iron-session'
import type { Role } from '~tests/e2e/fixtures/auth'
import { storageStateFor, TEST_EMAILS } from '~tests/e2e/fixtures/auth'

import { db } from '@acme/db'

import type { SessionData } from '~/server/session-options'
import { sessionOptions } from '~/server/session-options'

export const mintStorageState = async ({
  role,
  baseURL,
}: {
  role: Role
  baseURL: string
}) => {
  const user = await db.user.findUniqueOrThrow({
    select: { id: true },
    where: { email: TEST_EMAILS[role] },
  })

  const session: SessionData = { sessionId: randomUUID(), userId: user.id }

  const value = await sealData(session, {
    password: sessionOptions.password,
    ttl: sessionOptions.ttl,
  })

  const url = new URL(baseURL)

  const storageState = {
    cookies: [
      {
        domain: url.hostname,
        expires: Math.floor(Date.now() / 1000) + (sessionOptions.ttl ?? 0),
        httpOnly: true,
        name: sessionOptions.cookieName,
        path: '/',
        sameSite: 'Lax' as const,
        secure: url.protocol === 'https:',
        value,
      },
    ],
    origins: [],
  }

  const file = storageStateFor(role)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(storageState, null, 2))
}
