import { TRPCError } from '@trpc/server'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { createTestContext } from '~tests/trpc'

import { createBaseLogger } from '@acme/logging'

import { createTRPCRouter, protectedProcedure } from '../trpc'

import { handleTRPCError } from '~/app/api/helpers'
import * as loggerModule from '~/lib/logger'

const logger = createBaseLogger({
  clientIp: null,
  path: 'tests',
  userAgent: null,
})

vi.spyOn(logger, 'scope').mockReturnValue(logger)

vi.spyOn(loggerModule, 'createLogger').mockReturnValue(logger)

const logError = vi.spyOn(logger, 'error')
const logWarn = vi.spyOn(logger, 'warn')

const DB_HOST = 'db.internal.example:5432'

let failure = new Error('unset')

const testRouter = createTRPCRouter({
  fails: protectedProcedure.mutation(() => {
    throw failure
  }),
  validates: protectedProcedure
    .input(z.record(z.string(), z.string().max(0)))
    .mutation(() => 'ok'),
})

const createContext = () => createTestContext({ session: { userId: 'user' } })

const fetchProcedure = async (
  path: string,
  input?: Record<string, string>,
  context = createContext
) => {
  const res = await fetchRequestHandler({
    createContext: context,
    endpoint: '/api/trpc',
    req: new Request(`http://localhost/api/trpc/${path}`, {
      body: JSON.stringify({ json: input }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    }),
    router: testRouter,
  })

  return { body: await res.text(), status: res.status }
}

const manyInvalidFields = (count: number) =>
  Object.fromEntries(
    Array.from({ length: count }, (_, i) => [
      `field_${i}_${'x'.repeat(100)}`,
      'x',
    ])
  )

describe('internal error messages', () => {
  it.each([
    ['a plain error', new Error(`connect ECONNREFUSED ${DB_HOST}`)],
    ['a TypeError', new TypeError(`Cannot read properties of ${DB_HOST}`)],
    [
      'a TRPCError that takes its message from its cause',
      new TRPCError({
        cause: new Error(`connect ECONNREFUSED ${DB_HOST}`),
        code: 'INTERNAL_SERVER_ERROR',
      }),
    ],
  ])('hides the message of %s from the HTTP response', async (_, error) => {
    failure = error

    const { body, status } = await fetchProcedure('fails')

    expect(status).toBe(500)
    expect(body).toContain('"message":"Internal server error"')
    // Only the message is checked: tRPC adds the cause's stack outside
    // production only.
    expect(body).not.toContain(`"message":"${error.message}"`)
  })

  it('keeps the raw error in the log', async () => {
    logError.mockClear()
    failure = new Error(`connect ECONNREFUSED ${DB_HOST}`)

    await fetchProcedure('fails')

    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ cause: failure }),
      })
    )
  })

  it('keeps the message of a 4xx', async () => {
    failure = new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' })

    const { body, status } = await fetchProcedure('fails')

    expect(status).toBe(404)
    expect(body).toContain('"message":"Post not found"')
  })

  it('hides the message of an error raised while creating the context', async () => {
    const { body, status } = await fetchProcedure('fails', undefined, () => {
      throw new Error(`Can't reach database server at ${DB_HOST}`)
    })

    expect(status).toBe(500)
    expect(body).toContain('"message":"Internal server error"')
    expect(body).not.toContain(`"message":"Can't reach database server`)
  })
})

describe('validation errors', () => {
  it('bounds the HTTP response for a large invalid input', async () => {
    const { body, status } = await fetchProcedure(
      'validates',
      manyInvalidFields(5000)
    )

    expect(status).toBe(400)
    expect(body.length).toBeLessThan(10_000)
    expect(body).toContain('field_0_')
  })

  it('logs a bounded summary of a large invalid input', async () => {
    logWarn.mockClear()

    await fetchProcedure('validates', manyInvalidFields(5000))

    const [logPayload] = logWarn.mock.lastCall ?? []

    expect(logPayload).toMatchObject({
      context: {
        validation: {
          issueCount: 5000,
          issues: expect.arrayContaining([
            { code: 'too_big', path: expect.stringContaining('field_0_') },
          ]),
        },
      },
      merged: { statusCode: 400 },
    })
    expect(JSON.stringify(logPayload).length).toBeLessThan(10_000)
    expect(logPayload).toHaveProperty('error.cause', undefined)
  })
})

const restErrorSchema = z.object({ error: z.string() })

const toResponse = async (error: TRPCError) => {
  const res = handleTRPCError(error, 'Healthcheck failed')

  return {
    body: restErrorSchema.parse(await res.json()),
    status: res.status,
  }
}

describe(handleTRPCError, () => {
  it('returns the fallback message for a 5xx', async () => {
    await expect(
      toResponse(
        new TRPCError({
          cause: new Error(`connect ECONNREFUSED ${DB_HOST}`),
          code: 'INTERNAL_SERVER_ERROR',
        })
      )
    ).resolves.toStrictEqual({
      body: { error: 'Healthcheck failed' },
      status: 500,
    })
  })

  it('keeps and caps the message of a 4xx', async () => {
    const { body, status } = await toResponse(
      new TRPCError({ code: 'BAD_REQUEST', message: 'x'.repeat(5000) })
    )

    expect(status).toBe(400)
    expect(body.error).toHaveLength(1001)
  })
})
