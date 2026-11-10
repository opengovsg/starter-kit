import { describe, expect, it, vi } from 'vitest'

import { createBaseLogger } from '../index'

describe('base logger', () => {
  it('builds a request-scoped logger that logs, scopes, and audits', () => {
    const logger = createBaseLogger({
      clientIp: null,
      path: 'test',
      userAgent: null,
    })

    const boom = new Error('boom')
    const scoped = logger.scope({ action: 'request' })
    const info = vi.spyOn(logger, 'info')
    const error = vi.spyOn(scoped, 'error')
    const loginSucceeded = vi.spyOn(logger.audit.authn, 'loginSucceeded')

    logger.info({ message: 'hello' })
    scoped.error({
      error: boom,
      message: 'Request failed',
    })
    logger.audit.authn.loginSucceeded({
      privileged: false,
      role: 'user',
      userId: 'u1',
    })

    expect(info).toHaveBeenCalledExactlyOnceWith({ message: 'hello' })
    expect(error).toHaveBeenCalledExactlyOnceWith({
      error: boom,
      message: 'Request failed',
    })
    expect(loginSucceeded).toHaveBeenCalledExactlyOnceWith({
      privileged: false,
      role: 'user',
      userId: 'u1',
    })
  })

  it('exposes a request-less system logger', () => {
    const logger = createBaseLogger.system({ path: 'boot' })

    const info = vi.spyOn(logger, 'info')

    logger.info({ message: 'boot' })

    expect(info).toHaveBeenCalledExactlyOnceWith({ message: 'boot' })
  })
})
