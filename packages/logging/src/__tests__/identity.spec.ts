import type * as Logging from '@opengovsg/logging'
import { createLogging } from '@opengovsg/logging'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

vi.mock('@opengovsg/logging', async (importOriginal) => {
  const actual = await importOriginal<typeof Logging>()
  return {
    ...actual,
    createLogging: vi.fn<typeof actual.createLogging>(actual.createLogging),
  }
})

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  vi.stubEnv('NODE_ENV', 'test')
  vi.stubEnv('SKIP_ENV_VALIDATION', '')
  vi.stubEnv('DD_SERVICE', 'example-web')
  vi.stubEnv('NEXT_PUBLIC_APP_ENV', 'development')
  vi.stubEnv('NEXT_PUBLIC_APP_VERSION', 'local-version')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

it.each([
  {
    ddEnv: 'staging',
    ddVersion: 'release-version',
    env: 'staging',
    version: 'release-version',
  },
  {
    ddEnv: undefined,
    ddVersion: undefined,
    env: 'development',
    version: 'local-version',
  },
])(
  'uses the expected logger identity: $env/$version',
  async ({ ddEnv, ddVersion, env, version }) => {
    vi.stubEnv('DD_ENV', ddEnv)
    vi.stubEnv('DD_VERSION', ddVersion)
    await import('../index')
    expect(createLogging).toHaveBeenCalledWith(
      expect.objectContaining({
        service: 'example-web',
        env,
        version,
      })
    )
  }
)
