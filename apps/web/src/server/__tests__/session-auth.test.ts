import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetTables } from '~tests/db/utils'

import { db } from '@acme/db'

import { assertAuthedSessionUser } from '~/server/session-auth'
import type { SessionData } from '~/server/session'

const createSession = (data: SessionData) => ({
  ...data,
  destroy: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  save: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  updateConfig: vi.fn(),
})

describe('assertAuthedSessionUser', () => {
  beforeEach(async () => {
    await resetTables(['User', 'Account'])
  })

  it('returns null without destroying when session is anonymous', async () => {
    const session = createSession({})

    await expect(assertAuthedSessionUser(session)).resolves.toBeNull()
    expect(session.destroy).not.toHaveBeenCalled()
  })

  it('returns null and destroys when userId does not exist', async () => {
    const session = createSession({ userId: 'missing-user' })

    await expect(assertAuthedSessionUser(session)).resolves.toBeNull()
    expect(session.destroy).toHaveBeenCalledOnce()
  })

  it('returns userId when the user exists', async () => {
    const user = await db.user.create({
      data: { email: 'exists@example.com', name: 'Exists' },
    })
    const session = createSession({ userId: user.id })

    await expect(assertAuthedSessionUser(session)).resolves.toBe(user.id)
    expect(session.destroy).not.toHaveBeenCalled()
  })
})
