import { postgres, redis } from '@opengovsg/starter-kitty-testcontainers'
import { createGlobalSetup } from '@opengovsg/starter-kitty-testcontainers/vitest'

// Redis is shared across parallel workers, so start it with more logical DBs
// than any plausible worker count (default is 16); each worker selects its own
// in tests/redis/setup.ts. Postgres gets a per-file database instead.
export default createGlobalSetup([postgres(), redis({ databases: 256 })])
