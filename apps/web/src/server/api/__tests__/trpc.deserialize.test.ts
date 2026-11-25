import { serialize } from 'superjson'
import { describe, expect, it } from 'vitest'

import { inputTransformer, isObject } from './input-transformer'

describe('tRPC input deserialize', () => {
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
