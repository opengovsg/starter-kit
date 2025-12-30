import { TRPCError } from '@trpc/server'
import { resetTables } from '~tests/db/utils'
import { createTestCaller, createTestContext } from '~tests/trpc'

import { db } from '@acme/db'

describe('meRouter', () => {
  beforeEach(async () => {
    await resetTables(['User', 'Account'])
  })

  describe('get', () => {
    it('should throw UNAUTHORIZED error when user is not authenticated', async () => {
      const ctx = createTestContext(undefined)
      const caller = createTestCaller(ctx)

      try {
        await caller.me.get()
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError)
        expect((error as TRPCError).code).toEqual('UNAUTHORIZED')
      }
    })

    it('should return user data when authenticated', async () => {
      // Create a test user
      const testUser = await db.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
        },
      })

      const ctx = createTestContext({ session: { userId: testUser.id } })
      const caller = createTestCaller(ctx)
      const result = await caller.me.get()

      expect(result).toEqual({
        id: testUser.id,
        email: 'test@example.com',
        name: 'Test User',
        image: null,
      })
    })

    it('should return null when authenticated user does not exist in database', async () => {
      const ctx = createTestContext({
        session: { userId: 'non-existent-user-id' },
      })
      const caller = createTestCaller(ctx)
      const result = await caller.me.get()

      expect(result).toBeNull()
    })

    it('should return correct user when multiple users exist', async () => {
      // Create multiple test users
      const user1 = await db.user.create({
        data: {
          email: 'user1@example.com',
          name: 'User One',
        },
      })
      const user2 = await db.user.create({
        data: {
          email: 'user2@example.com',
          name: 'User Two',
        },
      })

      // Authenticate as user2
      const ctx = createTestContext({ session: { userId: user2.id } })
      const caller = createTestCaller(ctx)
      const result = await caller.me.get()

      expect(result).toEqual({
        id: user2.id,
        email: 'user2@example.com',
        name: 'User Two',
        image: null,
      })
      expect(result?.id).not.toBe(user1.id)
    })
  })
})
