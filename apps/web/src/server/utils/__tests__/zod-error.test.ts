import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { flattenZodError, summarizeZodError, truncate } from '../zod-error'

const CAPPED_FIRST_FIELD = /^field_0_x+…$/u

const recordError = (count: number) => {
  const result = z
    .record(z.string(), z.string())
    .safeParse(
      Object.fromEntries(
        Array.from({ length: count }, (_, i) => [
          `field_${i}_${'x'.repeat(500)}`,
          1,
        ])
      )
    )

  if (result.success) {
    throw new Error('expected a validation error')
  }

  return result.error
}

describe(truncate, () => {
  it('leaves a short string alone and caps a long one', () => {
    expect(truncate('short', 10)).toBe('short')
    expect(truncate('a'.repeat(20), 10)).toBe(`${'a'.repeat(10)}…`)
  })
})

describe(summarizeZodError, () => {
  it('keeps the issue count but only the first issues, with capped paths', () => {
    const summary = summarizeZodError(recordError(5000))

    expect(summary.issueCount).toBe(5000)
    expect(summary.issues).toHaveLength(10)
    expect(summary.issues[0]).toStrictEqual({
      code: 'invalid_type',
      path: expect.stringMatching(CAPPED_FIRST_FIELD),
    })
    expect(JSON.stringify(summary).length).toBeLessThan(3000)
  })

  it('caps the path depth', () => {
    const nested = z.object({
      a: z.object({
        b: z.object({
          c: z.object({ d: z.object({ e: z.object({ f: z.string() }) }) }),
        }),
      }),
    })

    const result = nested.safeParse({ a: { b: { c: { d: { e: { f: 1 } } } } } })

    if (result.success) {
      throw new Error('expected a validation error')
    }

    expect(summarizeZodError(result.error).issues[0]?.path).toBe('a.b.c.d.e')
  })
})

describe(flattenZodError, () => {
  it('caps the message of an unrecognized-keys issue, which lists every key', () => {
    const result = z.strictObject({ name: z.string() }).safeParse({
      name: 1,
      ...Object.fromEntries(
        Array.from({ length: 5000 }, (_, i) => [`key_${i}`, 1])
      ),
    })

    if (result.success) {
      throw new Error('expected a validation error')
    }

    const flattened = flattenZodError(result.error)

    expect(flattened.fieldErrors).toStrictEqual({
      name: [expect.stringContaining('expected string')],
    })
    expect(flattened.formErrors).toHaveLength(1)
    expect(flattened.formErrors[0]?.length).toBeLessThanOrEqual(201)
  })

  it('bounds the number of field errors', () => {
    const flattened = flattenZodError(recordError(5000))

    expect(Object.keys(flattened.fieldErrors)).toHaveLength(10)
    expect(JSON.stringify(flattened).length).toBeLessThan(5000)
  })
})
