import { type User } from '@prisma/client'

import {
  applyAuthedSession,
  createMockRequest,
  type applySession,
} from '~tests/integration/helpers/iron-session'

import { createCallerFactory } from '~/server/trpc'
import { meRouter } from '../me.router'

const createCaller = createCallerFactory(meRouter)

const TEST_USER: User = {
  email: 'test@example.com',
  id: 'test',
  name: 'Test User',
  image: null,
}

describe('auth.email', async () => {
  let caller: Awaited<ReturnType<typeof createCaller>>
  let session: ReturnType<typeof applySession>

  beforeEach(async () => {
    session = await applyAuthedSession(TEST_USER)
    const ctx = await createMockRequest(session)
    caller = createCaller(ctx)
  })

  describe('get', async () => {
    it('should return the user', async () => {
      // Act
      const result = await caller.get()

      // Assert
      expect(result).toEqual(TEST_USER)
    })
  })
})
