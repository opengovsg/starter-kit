import { describe, expect, it } from 'vitest'

import {
  assertClientMayWrite,
  isUpdateRequired,
  markUpdateRequired,
} from './version-sync'

describe('version-sync', () => {
  it('allows writes until mismatch, then blocks non-GET tRPC', () => {
    expect(isUpdateRequired()).toBe(false)
    expect(() => assertClientMayWrite('POST')).not.toThrow()
    expect(() => assertClientMayWrite('GET')).not.toThrow()

    markUpdateRequired()
    expect(isUpdateRequired()).toBe(true)
    expect(() => assertClientMayWrite('GET')).not.toThrow()
    expect(() => assertClientMayWrite('POST')).toThrow(
      'This app is out of date. Refresh the page to continue making changes.'
    )
  })
})
