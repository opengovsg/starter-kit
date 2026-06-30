import { describe, expect, it } from 'vitest'

import { createBaseLogger } from '../index'

describe('createBaseLogger', () => {
  it('builds a request-scoped logger that logs, scopes, and audits', () => {
    const logger = createBaseLogger({
      path: 'test',
      traceId: null,
      clientIp: null,
      userAgent: null,
    })

    expect(() => {
      logger.info({ message: 'hello' })
      logger.scope({ action: 'request' }).error({
        message: 'Request failed',
        error: new Error('boom'),
      })
      logger.audit.authn.loginSucceeded({
        userId: 'u1',
        role: 'user',
        privileged: false,
      })
    }).not.toThrow()
  })

  it('exposes a request-less system logger', () => {
    expect(() =>
      createBaseLogger.system({ path: 'boot' }).info({ message: 'boot' })
    ).not.toThrow()
  })
})
