import { describe, expect, it } from 'vitest'

import { readSessionState } from '../session-state'

describe(readSessionState, () => {
  it('treats a missing user id as anonymous', () => {
    expect(readSessionState({})).toStrictEqual({ kind: 'anon' })
  })

  it('treats an empty user id as anonymous', () => {
    expect(readSessionState({ sessionId: 'session', userId: '' })).toStrictEqual({
      kind: 'anon',
    })
  })

  it('returns a user session for a non-empty user id', () => {
    expect(
      readSessionState({ sessionId: 'session', userId: 'user_123' })
    ).toStrictEqual({
      kind: 'user',
      sessionId: 'session',
      userId: 'user_123',
    })
  })

  it('omits an empty session id from a user session', () => {
    expect(readSessionState({ sessionId: '', userId: 'user_123' })).toStrictEqual({
      kind: 'user',
      userId: 'user_123',
    })
  })
})
