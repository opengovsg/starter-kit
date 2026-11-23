import { RuleTester } from 'oxlint/plugins-dev'

import { noE2eDbWritesRule } from './no-e2e-db-writes.ts'

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' } },
})

tester.run('no-e2e-db-writes', noE2eDbWritesRule, {
  invalid: [
    'await db.user.create({ data: {} })',
    'await db.user.createMany({ data: [] })',
    'await db.user.createManyAndReturn({ data: [] })',
    'await db.user.update({ data: {}, where: { id } })',
    'await db.user.updateMany({ data: {} })',
    'await db.user.updateManyAndReturn({ data: {} })',
    'await db.user.upsert({ where: { id }, create: {}, update: {} })',
    'await db.user.delete({ where: { id } })',
    'await db.user.deleteMany({})',
    'await db.$executeRawUnsafe("select 1")',
    'await db.$executeRaw`select 1`',
    'await db.$transaction([])',
    'await db.update({})',
    "await db.user['delete']({ where: { id } })",
    'await db?.user.delete({ where: { id } })',
  ].map((code) => ({ code, errors: [{ messageId: 'write' }] })),
  valid: [
    'await db.user.findUnique({ where: { email } })',
    'await db.user.findFirstOrThrow({})',
    'await db.user.count()',
    'await db.user.aggregate({})',
    'await db.$queryRaw`select 1`',
    'await db.$queryRawUnsafe("select 1")',
    'await client.user.update({})',
    'const update = db.user.findUnique',
  ].map((code) => ({ code })),
})
