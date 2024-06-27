import { type User } from '@prisma/client'
import { it, expect } from 'vitest'
import { type RouterInput } from '~/utils/trpc'
import {
  applyAuthedSession,
  applySession,
  createMockRequest,
} from 'tests/integration/helpers/iron-session'
import { createCallerFactory } from '~/server/trpc'
import { postRouter } from '../post.router'

const createCaller = createCallerFactory(postRouter)

describe('post.add', async () => {
  it('unauthed user should not be able to create a post', async () => {
    const ctx = await createMockRequest(applySession())
    const caller = createCaller(ctx)

    const input: RouterInput['post']['add'] = {
      title: 'hello test',
      content: 'hello test with a long input',
      contentHtml: '<p>hello test with a long input</p>',
    }

    await expect(caller.add(input)).rejects.toThrowError()
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
    const caller = createCaller(ctx)

    const input: RouterInput['post']['add'] = {
      title: 'hello test',
      content: 'hello test with a long input',
      contentHtml: '<p>hello test with a long input</p>',
    }

    const post = await caller.add(input)
    const byId = await caller.byId({ id: post.id })

    expect(byId).toMatchObject(input)
  })
})
