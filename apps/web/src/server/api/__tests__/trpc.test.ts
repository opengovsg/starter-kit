import { TRPCError } from '@trpc/server'
import { serialize } from 'superjson'
import { describe, expect, it } from 'vitest'

import { createTRPCRouter } from '../trpc'

const isObject = (value: unknown): value is object =>
  typeof value === 'object' && value !== null

const inputTransformer = createTRPCRouter({})._def._config.transformer.input

describe('tRPC input deserialize', () => {
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

  it('rejects a set annotation in the first array child', () => {
    const payload = {
      json: [{ s: [1, 2] }],
      meta: { values: ['Date', [{ s: ['set'] }]] },
    }

    expect(() => {
      inputTransformer.deserialize(payload)
    }).toThrow('Input must not contain a Set or Map')
  })

  it('rejects a set annotation nested past the first two children', () => {
    const payload = {
      json: { o: { 2: [1, 2] } },
      meta: { values: { o: ['number', [null, null, ['set']]] } },
    }

    expect(() => {
      inputTransformer.deserialize(payload)
    }).toThrow('Input must not contain a Set or Map')
  })

  it.each([
    ['root Set', new Set([1])],
    ['nested Map', { a: [{ m: new Map([[1, 2]]) }] }],
  ])('rejects a %s', (_label, value) => {
    expect(() => {
      inputTransformer.deserialize(serialize(value))
    }).toThrow('Input must not contain a Set or Map')
  })

  it('deserializes input that has no meta', () => {
    const output: unknown = inputTransformer.deserialize({ json: { a: 1 } })

    expect(output).toStrictEqual({ a: 1 })
  })

  it('still restores Dates, bigints, undefined, and shared references', () => {
    const shared = { at: new Date(0) }

    const input = {
      map: [shared],
      n: 1n,
      nothing: undefined,
      set: shared,
    }

    const output: unknown = inputTransformer.deserialize(serialize(input))

    expect(output).toStrictEqual(input)

    if (!isObject(output) || !('map' in output) || !Array.isArray(output.map)) {
      throw new Error('expected deserialized object with map')
    }

    expect(output.map[0]).toBe('set' in output ? output.set : undefined)
  })
})
