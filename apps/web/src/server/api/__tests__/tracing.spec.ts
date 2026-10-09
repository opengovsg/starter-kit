import { initTRPC, TRPCError } from '@trpc/server'
import type { Span } from 'dd-trace'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { tagSpanTrpcProcedure, tracingMiddleware } from '../tracing'

const { setTag, trace } = vi.hoisted(() => {
  const setTag = vi.fn<Span['setTag']>()
  const trace = async (
    _name: string,
    _options: object,
    callback: (span: { setTag: typeof setTag }) => Promise<unknown>
  ) => callback({ setTag })
  return { setTag, trace: vi.fn<typeof trace>(trace) }
})

vi.mock('dd-trace', () => ({ tracer: { trace } }))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('tagSpanTrpcProcedure', () => {
  const procedures = new Set(['me.get', 'auth.signOut'])

  it.each([
    ['GET', '/api/trpc/me.get?input=private'],
    ['POST', '/api/trpc/auth.signOut/'],
  ])('names registered %s requests without query data', (method, url) => {
    const path = method === 'GET' ? 'me.get' : 'auth.signOut'
    tagSpanTrpcProcedure({ setTag }, { method, url }, procedures)
    expect(setTag.mock.calls).toEqual([
      ['trpc.procedure', path],
      ['resource.name', `${method} /api/trpc/${path}`],
    ])
  })

  it.each([
    { method: 'GET', url: '/api/trpc/unknown.user-controlled' },
    { method: 'GET', url: '/api/trpc/me.get,auth.signOut?batch=1' },
    { method: 'GET', url: '/other/me.get' },
    { method: 'OPTIONS', url: '/api/trpc/me.get' },
    { method: 'GET', url: undefined },
  ])('leaves other requests unchanged: $url', (req) => {
    tagSpanTrpcProcedure({ setTag }, req, procedures)
    expect(setTag).not.toHaveBeenCalled()
  })
})

describe('tracingMiddleware', () => {
  const t = initTRPC.create()
  const procedure = t.procedure.use(tracingMiddleware)
  const router = t.router({
    success: procedure.query(() => 'ok'),
    denied: procedure
      .use(() => {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      })
      .mutation(() => 'unreachable'),
  })
  const caller = router.createCaller({})

  it('preserves successful results and records the procedure identity', async () => {
    await expect(caller.success()).resolves.toBe('ok')
    expect(trace).toHaveBeenCalledWith(
      'trpc.procedure',
      {
        resource: 'success',
        tags: { 'trpc.procedure': 'success', 'trpc.type': 'query' },
      },
      expect.any(Function)
    )
    expect(setTag).not.toHaveBeenCalled()
  })

  it('flags returned middleware errors and preserves caller rejection', async () => {
    await expect(caller.denied()).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    })
    expect(trace).toHaveBeenCalledWith(
      'trpc.procedure',
      {
        resource: 'denied',
        tags: { 'trpc.procedure': 'denied', 'trpc.type': 'mutation' },
      },
      expect.any(Function)
    )
    expect(setTag).toHaveBeenCalledWith(
      'error',
      expect.objectContaining({ code: 'UNAUTHORIZED' })
    )
  })
})
