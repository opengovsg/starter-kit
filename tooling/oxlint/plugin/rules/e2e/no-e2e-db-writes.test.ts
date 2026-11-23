import { RuleTester } from 'oxlint/plugins-dev'

import { noE2eDbWritesRule } from './no-e2e-db-writes.ts'

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' } },
})

const dbFile = '/tmp/app/tests/e2e/helpers/user.db.ts'

const write = (code: string) => ({
  code,
  errors: [{ messageId: 'write' }],
  filename: dbFile,
})

tester.run('no-e2e-db-writes', noE2eDbWritesRule, {
  invalid: [
    write('await db.user.create({ data: {} })'),
    write('await db.user.createMany({ data: [] })'),
    write('await db.user.createManyAndReturn({ data: [] })'),
    write('await db.user.update({ data: {}, where: { id } })'),
    write('await db.user.updateMany({ data: {} })'),
    write('await db.user.updateManyAndReturn({ data: {} })'),
    write('await db.user.upsert({ where: { id }, create: {}, update: {} })'),
    write('await db.user.delete({ where: { id } })'),
    write('await db.user.deleteMany({})'),
    write('await db.$executeRawUnsafe("select 1")'),
    write('await db.$executeRaw`select 1`'),
    write('await db.$transaction([])'),
    write('await db.update({})'),
    write("await db.user['delete']({ where: { id } })"),
    write('await db?.user.delete({ where: { id } })'),
  ],
  valid: [
    {
      code: 'await db.user.findUnique({ where: { email } })',
      filename: dbFile,
    },
    { code: 'await db.user.findFirstOrThrow({})', filename: dbFile },
    { code: 'await db.user.count()', filename: dbFile },
    { code: 'await db.user.aggregate({})', filename: dbFile },
    { code: 'await db.$queryRaw`select 1`', filename: dbFile },
    { code: 'await db.$queryRawUnsafe("select 1")', filename: dbFile },
    { code: 'await client.user.update({})', filename: dbFile },
    { code: 'const update = db.user.findUnique', filename: dbFile },
    {
      code: 'await db.user.update({})',
      filename: '/tmp/app/tests/e2e/helpers/user.factory.ts',
    },
    { code: 'await db.user.delete({})', filename: '/tmp/src/user.service.ts' },
  ],
})
