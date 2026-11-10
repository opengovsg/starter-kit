import { describe, expect, it } from 'vitest'

import { createBaseLogger } from '../index'

describe('base logger', () => {
  it('builds a request-scoped logger that logs, scopes, and audits', () => {
    const logger = createBaseLogger({
      clientIp: null,
      path: 'test',
      userAgent: null,
    })

    expect(logger).toBeDefined()
    logger.info({ message: 'hello' })
    logger.scope({ action: 'request' }).error({
      error: new Error('boom'),
      message: 'Request failed',
    })
    logger.audit.authn.loginSucceeded({
      privileged: false,
      role: 'user',
      userId: 'u1',
    })
  })

  it('exposes a request-less system logger', () => {
    const logger = createBaseLogger.system({ path: 'boot' })
    expect(logger).toBeDefined()
    logger.info({ message: 'boot' })
  })
})
