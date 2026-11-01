import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { sealData } from 'iron-session'

import { db } from '@acme/db'

import type { Role } from '../fixtures/auth'
import { storageStateFor, TEST_EMAILS } from '../fixtures/auth'

import type { SessionData } from '~/server/session-options'
import { sessionOptions } from '~/server/session-options'

/**
 * Writes a Playwright storage state holding a signed-in session cookie for
 * the role's user, sealed the same way `ctx.session.save()` does after OTP
 * login. Skips the OTP UI for every test; auth/sign-in.e2e.ts covers that UI.
 */
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
