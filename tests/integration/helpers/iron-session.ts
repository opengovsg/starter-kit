import { type User } from '@prisma/client'
import { type IronSession } from 'iron-session'
import { type NextApiRequest } from 'next'
import { type Context, createContextInner } from '~/server/context'
import { auth } from './auth'

class MockIronStore {
  private static instance: MockIronStore

  private saved: { [key: string]: string | object | number }

  private unsaved: { [key: string]: string | object | number }

  private constructor() {
    this.saved = {}
    this.unsaved = {}
  }

  static getOrCreateStore(): MockIronStore {
    if (!MockIronStore.instance) {
      MockIronStore.instance = new MockIronStore()
    }
    return MockIronStore.instance
  }

  get(key: string) {
    return this.unsaved[key] || undefined
  }

  set(key: string, val: string | object | number) {
    this.unsaved[key] = val
  }

  unset(key: string) {
    delete this.unsaved[key]
  }

  seal() {
    this.saved = { ...this.unsaved }
  }

  clear() {
    this.unsaved = {}
  }
}

export const createMockRequest = async (
  session: IronSession,
  mockedReq: Partial<NextApiRequest> = { headers: {} }
): Promise<Context> => {
  const innerContext = await createContextInner({ session })

  return {
    ...innerContext,
    req: mockedReq as NextApiRequest,
  }
}

export const applySession = () => {
  const store = MockIronStore.getOrCreateStore()

  const session = {
    set: store.set.bind(store),
    get: store.get.bind(store),
    unset: store.unset,
    async save() {
      store.seal()
    },
    destroy() {
      store.clear()
    },
  } as IronSession

  return session
}

export const applyAuthedSession = async (user: Partial<User>) => {
  const authedUser = await auth(user)
  const session = applySession()
  session.user = authedUser
  session.save()
  return session
}
