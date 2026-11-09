import { describe, expect, it, vi } from 'vitest'

import { createTestCaller, createTestContext } from '~tests/trpc'

describe('authRouter.logout', () => {
  it('audits sessionTerminated when userId is set but sessionId is missing', async () => {
    const ctx = createTestContext({
      session: { userId: 'user-without-session-id' },
    })
    const auditSpy = vi
      .spyOn(ctx.logger.audit.authn, 'sessionTerminated')
      .mockImplementation(() => undefined)

    const caller = createTestCaller(ctx)
    await caller.auth.logout()

    expect(auditSpy).toHaveBeenCalledOnce()
    expect(auditSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: 'logout',
        userId: 'user-without-session-id',
        sessionId: expect.any(String),
      })
    )
    expect(ctx.session.destroy).toHaveBeenCalled()
  })
})
