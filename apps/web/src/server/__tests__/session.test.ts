import { describe, expect, it } from 'vitest'

import { isSessionAuthed } from '../session'

describe(isSessionAuthed, () => {
  it('treats a missing user id as anonymous', () => {
    expect(isSessionAuthed({})).toBeFalsy()
  })

  it('treats an empty user id as anonymous', () => {
    expect(isSessionAuthed({ sessionId: 'session', userId: '' })).toBeFalsy()
  })

  it('treats a non-empty user id as signed in', () => {
    expect(isSessionAuthed({ sessionId: '', userId: 'user_123' })).toBeTruthy()
  })
})
