/**
 * Runs once per `playwright test` invocation, after `webServer` has started
 * (the app connects to Postgres/Redis lazily, so it boots before they exist).
 *
 * State is reset per run, not per test: tests run fully in parallel, so each
 * test creates its own uniquely named data instead of relying on a clean DB.
 */
import { assertAppUsesDatabase, resetDatabase, startDatabase } from './setup/db'
import { flushRedis, startRedis } from './setup/redis'

const globalSetup = async () => {
  const [db, cache] = await Promise.all([startDatabase(), startRedis()])
  assertAppUsesDatabase(db)
  await Promise.all([resetDatabase(db), flushRedis(cache)])
}

export default globalSetup
