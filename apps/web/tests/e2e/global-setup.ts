import {
  assertAppUsesDatabase,
  resetDatabase,
  startDatabase,
} from '~tests/e2e/setup/db'
import { flushRedis, startRedis } from '~tests/e2e/setup/redis'
import { seedUsers } from '~tests/e2e/setup/seed'

const globalSetup = async () => {
  const [db, cache] = await Promise.all([startDatabase(), startRedis()])
  assertAppUsesDatabase(db)
  await Promise.all([resetDatabase(db), flushRedis(cache)])
  await seedUsers()
}

export default globalSetup
