import { TRPCError } from '@trpc/server'
import { serialize } from 'superjson'
import { describe, expect, it } from 'vitest'

import { inputTransformer } from './input-transformer'

describe('tRPC input deserialize limits', () => {
  it('rejects a Set built to make superjson quadratic, before walking it', () => {
    const n = 8000

    const payload = {
      json: Array.from({ length: n }, () => []),
      meta: {
        referentialEqualities: {
          0: Array.from({ length: n }, (_, i) => String(n - 1 - i)),
        },
        values: ['set'],
      },
    }

    const start = performance.now()

    expect(() => {
      inputTransformer.deserialize(payload)
    }).toThrow(TRPCError)
    expect(performance.now() - start).toBeLessThan(100)
  })

  it('rejects a deep annotation path with many children, before walking it', () => {
    const children = Object.fromEntries(
      Array.from({ length: 2000 }, (_, i) => [i, ['undefined']])
    )

    const payload = {
      json: {},
      meta: {
        values: {
          [Array.from({ length: 20_000 }).fill('a').join('.')]: [
            'undefined',
            children,
          ],
        },
      },
    }

    const start = performance.now()

    expect(() => {
      inputTransformer.deserialize(payload)
    }).toThrow('Input is too complex')
    expect(performance.now() - start).toBeLessThan(100)
  })

  it('rejects too many annotation nodes', () => {
    const value = Array.from({ length: 10_001 }, () => ({ x: undefined }))

    expect(() => {
      inputTransformer.deserialize(serialize(value))
    }).toThrow('Input is too complex')
  })

  it.each([
    [
      'string children',
      {
        json: '2020-01-01T00:00:00.000Z',
        meta: { values: ['Date', 'x'] },
      },
    ],
    ['string values', { json: { a: 1 }, meta: { values: 'x' } }],
  ])('fails fast when an annotation is %s', (_label, payload) => {
    const start = performance.now()

    expect(() => {
      inputTransformer.deserialize(payload)
    }).toThrow(RangeError)
    expect(performance.now() - start).toBeLessThan(100)
  })
})
