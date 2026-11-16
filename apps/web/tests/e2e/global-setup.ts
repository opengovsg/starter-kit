import { assertAppUsesDatabase, resetDatabase, startDatabase } from './setup/db'
import { flushRedis, startRedis } from './setup/redis'
import { seedUsers } from './setup/seed'

const globalSetup = async () => {
  const [db, cache] = await Promise.all([startDatabase(), startRedis()])
  assertAppUsesDatabase(db)
  await Promise.all([resetDatabase(db), flushRedis(cache)])
  await seedUsers()
}

export default globalSetup
