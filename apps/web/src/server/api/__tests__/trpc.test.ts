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

  it.each([
    [
      'root {length:n} typed-array',
      {
        json: { length: 1_000_000 },
        meta: { values: [['typed-array', 'Float64Array']] },
      },
    ],
    [
      'numeric length typed-array',
      {
        json: 1_000_000,
        meta: { values: [['typed-array', 'Float64Array']] },
      },
    ],
    [
      'nested typed-array',
      {
        json: { buf: { length: 1_000_000 } },
        meta: { values: { buf: [['typed-array', 'Uint8Array']] } },
      },
    ],
  ])('does not allocate a %s', (_label, payload) => {
    const start = performance.now()

    expect(() => {
      inputTransformer.deserialize(payload)
    }).toThrow(TypeError)
    expect(performance.now() - start).toBeLessThan(100)
  })

  it('still restores a real typed array', () => {
    const value = new Float64Array([1, 2, 3])

    expect(inputTransformer.deserialize(serialize(value))).toStrictEqual(value)
  })

  it('deserializes input that has no meta', () => {
    const output: unknown = inputTransformer.deserialize({ json: { a: 1 } })

    expect(output).toStrictEqual({ a: 1 })
  })

  it('deserializes a Date when its annotation children are null', () => {
    const output: unknown = inputTransformer.deserialize({
      json: '2020-01-01T00:00:00.000Z',
      meta: { values: ['Date', null] },
    })

    expect(output).toStrictEqual(new Date('2020-01-01T00:00:00.000Z'))
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
