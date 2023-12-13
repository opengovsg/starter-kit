import { type User } from '@prisma/client'
import { it, expect } from 'vitest'
import { type RouterInput } from '~/utils/trpc'
import { appRouter } from '../../_app'
import {
  applyAuthedSession,
  applySession,
  createMockRequest,
} from 'tests/integration/helpers/iron-session'

describe('post.add', async () => {
  it('unauthed user should not be able to create a post', async () => {
    const ctx = await createMockRequest(applySession())
    const caller = appRouter.createCaller(ctx)

    const input: RouterInput['post']['add'] = {
      title: 'hello test',
      content: 'hello test with a long input',
      contentHtml: '<p>hello test with a long input</p>',
    }

    await expect(caller.post.add(input)).rejects.toThrowError()
  })

  it('post should be retrievable after creation', async () => {
    const defaultUser: User = {
      email: 'test@example.com',
      username: 'test-user',
      name: 'Test User',
      id: 'test-user-id',
      bio: null,
      emailVerified: null,
      image: null,
    }
    const ctx = await createMockRequest(await applyAuthedSession(defaultUser))
    const caller = appRouter.createCaller(ctx)

    const input: RouterInput['post']['add'] = {
      title: 'hello test',
      content: 'hello test with a long input',
      contentHtml: '<p>hello test with a long input</p>',
    }

    const post = await caller.post.add(input)
    const byId = await caller.post.byId({ id: post.id })

    expect(byId).toMatchObject(input)
  })
})
