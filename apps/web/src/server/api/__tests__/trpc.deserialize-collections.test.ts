import { serialize } from 'superjson'
import { describe, expect, it } from 'vitest'

import { inputTransformer } from './input-transformer'

describe('tRPC input deserialize collections', () => {
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
})
