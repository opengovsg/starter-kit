import { describe, expect, it } from 'vitest'

import { isSessionAuthed } from '~/server/session'

describe('isSessionAuthed', () => {
  it('returns false when userId is missing', () => {
    expect(isSessionAuthed({})).toBe(false)
  })

  it('returns false when userId is empty', () => {
    expect(isSessionAuthed({ userId: '' })).toBe(false)
  })

  it('returns true when userId is non-empty', () => {
    expect(isSessionAuthed({ userId: 'user-1' })).toBe(true)
  })
})
