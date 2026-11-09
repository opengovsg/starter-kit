// Cases are source text; `${…}` belongs to the SQL templates under test.
/* oxlint-disable no-template-curly-in-string */
import { RuleTester } from 'oxlint/plugins-dev'

import { requireExplicitUserColumnsRule } from './require-explicit-user-columns.ts'

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' } },
})

const ROW_METHODS = [
  'create',
  'createManyAndReturn',
  'delete',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'findUnique',
  'findUniqueOrThrow',
  'update',
  'updateManyAndReturn',
  'upsert',
]

// Return counts or aggregates, never user rows.
const NON_ROW_METHODS = [
  'aggregate',
  'count',
  'createMany',
  'deleteMany',
  'groupBy',
  'updateMany',
]

const CLIENTS = ['db', 'tx', 'prisma', 'ctx.db', 'this.db']

// Any model's call can load the `user` relation.
const RELATION_CALLS = [
  'db.account.findMany',
  'db.account.findUnique',
  'db.account.create',
  'db.account.update',
  'db.account.upsert',
  'db.account.delete',
  'tx.session.findFirst',
]

const KYSELY_TABLE_METHODS = [
  'deleteFrom',
  'insertInto',
  'mergeInto',
  'replaceInto',
  'selectFrom',
  'updateTable',
]

const KYSELY_JOINS = [
  'crossJoin',
  'fullJoin',
  'innerJoin',
  'leftJoin',
  'rightJoin',
]

const missing = (method: string) => ({
  data: { method },
  messageId: 'missingSelect',
})

const relation = { messageId: 'relationWithoutSelect' }

const kysely = (method: string) => ({
  data: { method },
  messageId: 'kyselyAll',
})

const raw = { messageId: 'rawSelectStar' }

tester.run(
  'acme/require-explicit-user-columns',
  requireExplicitUserColumnsRule,
  {
    invalid: [
      // --- Prisma `user` delegate ---
      // Every row method, on every client shape, with no args.
      ...ROW_METHODS.flatMap((method) =>
        CLIENTS.map((client) => ({
          code: `${client}.user.${method}()`,
          errors: [missing(method)],
          name: `${client}.user.${method}() without args`,
        }))
      ),
      // Every row method with args that omit select.
      ...ROW_METHODS.map((method) => ({
        code: `db.user.${method}({ where: { id } })`,
        errors: [missing(method)],
        name: `${method} with where only`,
      })),
      // Every row method with a nullish select.
      ...ROW_METHODS.flatMap((method) =>
        [
          'null',
          'undefined',
          'void 0',
          'cond ? defaultUserSelect : undefined',
          'cond ? null : defaultUserSelect',
        ].map((value) => ({
          code: `db.user.${method}({ select: ${value} })`,
          errors: [{ data: { method }, messageId: 'nullishSelect' }],
          name: `${method} with select: ${value}`,
        }))
      ),
      // Every row method with a spread that can override select.
      ...ROW_METHODS.map((method) => ({
        code: `db.user.${method}({ select: defaultUserSelect, ...args })`,
        errors: [missing(method)],
        name: `${method} with spread after select`,
      })),
      {
        code: "db['user'].findMany()",
        errors: [missing('findMany')],
        name: 'string delegate access',
      },
      {
        code: "db.user['findMany']()",
        errors: [missing('findMany')],
        name: 'string method access',
      },
      {
        code: 'db[`user`][`findMany`]()',
        errors: [missing('findMany')],
        name: 'template-literal access',
      },
      {
        code: 'db?.user.findMany()',
        errors: [missing('findMany')],
        name: 'optional client',
      },
      {
        code: 'db.user?.findMany()',
        errors: [missing('findMany')],
        name: 'optional delegate',
      },
      {
        code: 'db.user.findMany?.()',
        errors: [missing('findMany')],
        name: 'optional call',
      },
      {
        code: 'db.user.findMany(args)',
        errors: [missing('findMany')],
        name: 'opaque args identifier',
      },
      {
        code: 'db.user.findMany(buildArgs())',
        errors: [missing('findMany')],
        name: 'opaque args call',
      },
      {
        code: 'db.user.findMany({ ...args })',
        errors: [missing('findMany')],
        name: 'spread without select',
      },
      {
        code: 'db.user.findMany({ ...{ select: defaultUserSelect } })',
        errors: [missing('findMany')],
        name: 'select hidden in spread',
      },
      {
        code: 'db.user.findMany({ ...a, select: s, ...b })',
        errors: [missing('findMany')],
        name: 'spread on both sides of select',
      },
      {
        code: 'db.user.findMany({ [key]: defaultUserSelect })',
        errors: [missing('findMany')],
        name: 'computed key',
      },
      {
        code: 'db.user.findMany({ include: { accounts: true } })',
        errors: [missing('findMany')],
        name: 'include instead of select',
      },
      {
        code: 'db.user.findMany({ omit: { email: true } })',
        errors: [missing('findMany')],
        name: 'omit instead of select',
      },
      {
        code: 'db.user.findMany({ Select: defaultUserSelect })',
        errors: [missing('findMany')],
        name: 'wrong-case key',
      },
      {
        code: 'db.user.findMany(undefined, { select: defaultUserSelect })',
        errors: [missing('findMany')],
        name: 'select in second arg',
      },
      {
        code: 'Promise.all([db.user.findMany(), tx.user.findFirst({ where })])',
        errors: [missing('findMany'), missing('findFirst')],
        name: 'reports each call',
      },
      {
        code: `
        await db.$transaction(async (tx) => {
          await tx.user.upsert({ create, update, where: { email } })
        })
      `,
        errors: [missing('upsert')],
        name: 'inside transaction callback',
      },

      // --- Prisma `user` relation through other models ---
      ...RELATION_CALLS.flatMap((call) =>
        ['include', 'select'].flatMap((key) => [
          {
            code: `${call}({ ${key}: { user: true } })`,
            errors: [relation],
            name: `${call} ${key} user: true`,
          },
          {
            code: `${call}({ ${key}: { user: {} } })`,
            errors: [relation],
            name: `${call} ${key} user: {}`,
          },
          {
            code: `${call}({ ${key}: { user: { include: { accounts: true } } } })`,
            errors: [relation],
            name: `${call} ${key} user with nested include only`,
          },
        ])
      ),
      {
        code: 'db.account.findMany({ include: { user: { select: null } } })',
        errors: [relation],
        name: 'relation with null select',
      },
      {
        code: 'db.account.findMany({ include: { user: { select: undefined } } })',
        errors: [relation],
        name: 'relation with undefined select',
      },
      {
        code: 'db.account.findMany({ include: { user: { select: cond ? s : void 0 } } })',
        errors: [relation],
        name: 'relation with conditional undefined select',
      },
      // Fluent API returns the related User row.
      ...[
        'db.account.findUnique({ where }).user()',
        'db.account.findUniqueOrThrow({ where }).user({})',
        'db.account.findFirst({ where }).user({ include: { accounts: true } })',
        'db.account.findUnique({ where }).user({ select: undefined })',
        'tx.session.findUnique({ where }).account().user()',
        'await db.account.update({ where, data }).user()',
      ].map((code) => ({ code, errors: [relation], name: `fluent ${code}` })),
      {
        code: 'db.account.findMany({ include: { user: { select: s, ...rest } } })',
        errors: [relation],
        name: 'relation with spread after select',
      },
      {
        code: 'db.account.findMany({ include: { user: userArgs } })',
        errors: [relation],
        name: 'relation with opaque args',
      },
      {
        code: 'db.account.findMany({ include: { user: cond } })',
        errors: [relation],
        name: 'relation with conditional boolean',
      },
      {
        code: "db.account.findMany({ include: { 'user': true } })",
        errors: [relation],
        name: 'quoted relation key',
      },
      {
        code: "db.account.findMany({ ['include']: { ['user']: true } })",
        errors: [relation],
        name: 'computed string keys',
      },
      {
        code: 'db.post.findMany({ include: { comments: { include: { user: true } } } })',
        errors: [relation],
        name: 'nested relation',
      },
      {
        code: 'db.session.findMany({ select: { id: true, account: { select: { user: true } } } })',
        errors: [relation],
        name: 'nested relation inside select',
      },
      {
        code: 'const args = { include: { user: true } }',
        errors: [relation],
        name: 'args built outside the call',
      },
      {
        code: 'db.user.findMany({ select: { id: true, user: true } })',
        errors: [relation],
        name: 'self relation inside user select',
      },

      // --- Kysely ---
      ...KYSELY_TABLE_METHODS.flatMap((method) => [
        {
          code: `db.$kysely.${method}('User').selectAll().execute()`,
          errors: [kysely('selectAll')],
          name: `${method}('User').selectAll()`,
        },
        {
          code: `db.$kysely.${method}('User').returningAll().execute()`,
          errors: [kysely('returningAll')],
          name: `${method}('User').returningAll()`,
        },
      ]),
      ...KYSELY_JOINS.map((join) => ({
        code: `db.$kysely.selectFrom('Account').${join}('User', 'User.id', 'Account.userId').selectAll().execute()`,
        errors: [kysely('selectAll')],
        name: `${join}('User') then selectAll()`,
      })),
      {
        code: "db.$kysely.selectFrom('User as u').selectAll().execute()",
        errors: [kysely('selectAll')],
        name: 'aliased table',
      },
      {
        code: "db.$kysely.selectFrom('User as u').selectAll('u').execute()",
        errors: [kysely('selectAll')],
        name: 'selectAll on alias',
      },
      {
        code: "db.$kysely.selectFrom('Account').innerJoin('User', 'User.id', 'Account.userId').selectAll('User').execute()",
        errors: [kysely('selectAll')],
        name: "selectAll('User') on join",
      },
      {
        code: "db.$kysely.selectFrom('Account').innerJoin('User', 'User.id', 'Account.userId').selectAll(['Account', 'User']).execute()",
        errors: [kysely('selectAll')],
        name: 'selectAll array including User',
      },
      {
        code: "db.$kysely.selectFrom(['Account', 'User']).selectAll().execute()",
        errors: [kysely('selectAll')],
        name: 'selectFrom array',
      },
      {
        code: "db.$kysely.selectFrom('Account').selectAll().innerJoin('User', 'User.id', 'Account.userId').execute()",
        errors: [kysely('selectAll')],
        name: 'join after selectAll',
      },
      {
        code: "trx.selectFrom('User').where('id', '=', id).selectAll().executeTakeFirst()",
        errors: [kysely('selectAll')],
        name: 'transaction builder with where',
      },
      {
        code: "db.$kysely.selectFrom('User').selectAll('User')",
        errors: [kysely('selectAll')],
        name: "selectAll('User') on base table",
      },

      // --- Raw SQL ---
      {
        code: 'db.$queryRaw`SELECT * FROM "User" WHERE id = ${id}`',
        errors: [raw],
        name: '$queryRaw select *',
      },
      {
        code: 'tx.$queryRaw`select u.* from "User" u`',
        errors: [raw],
        name: '$queryRaw aliased star',
      },
      {
        code: 'db.$queryRaw`SELECT "User".* FROM "User"`',
        errors: [raw],
        name: '$queryRaw quoted table star',
      },
      {
        code: 'db.$executeRaw`UPDATE "User" SET name = ${name} RETURNING *`',
        errors: [raw],
        name: '$executeRaw returning *',
      },
      {
        code: 'db.$queryRawUnsafe(\'SELECT * FROM "User"\')',
        errors: [raw],
        name: '$queryRawUnsafe string',
      },
      {
        code: 'db.$queryRawUnsafe(`SELECT * FROM "User" WHERE id = $1`, id)',
        errors: [raw],
        name: '$queryRawUnsafe template',
      },
      {
        code: 'db.$executeRawUnsafe(\'DELETE FROM "User" RETURNING *\')',
        errors: [raw],
        name: '$executeRawUnsafe returning *',
      },
      {
        code: 'sql`SELECT * FROM "User"`.execute(db.$kysely)',
        errors: [raw],
        name: 'kysely sql tag',
      },
      {
        code: 'db.$queryRaw`SELECT * FROM "Account" JOIN "User" ON "User".id = "Account".user_id`',
        errors: [raw],
        name: 'star across join',
      },
    ],
    valid: [
      // --- Prisma `user` delegate ---
      // Every row method, on every client shape, with select.
      ...ROW_METHODS.flatMap((method) =>
        CLIENTS.map(
          (client) =>
            `${client}.user.${method}({ select: defaultUserSelect, where: { id } })`
        )
      ),
      // Count/batch methods return no user fields.
      ...NON_ROW_METHODS.map((method) => `db.user.${method}({ where })`),
      ...NON_ROW_METHODS.map((method) => `db.user.${method}()`),
      'db.user.findMany({ select: { id: true } })',
      'db.user.findMany({ select })',
      "db.user.findMany({ 'select': defaultUserSelect })",
      "db.user.findMany({ ['select']: defaultUserSelect })",
      'db.user.findMany({ [`select`]: defaultUserSelect })',
      'db.user.findMany({ ...page, select: defaultUserSelect })',
      'db.user.findMany({ select: a, ...page, select: b })',
      'db.user.findMany({ select: getSelect() })',
      "db['user'].findMany({ select: defaultUserSelect })",
      'db.user?.findMany?.({ select: defaultUserSelect })',
      // References are not calls: tRPC procedures and test mocks.
      'trpc.user.findMany.queryOptions()',
      'trpc.user.update.mutationOptions()',
      'api.user.findUnique.useQuery({ id })',
      'client.user.create.mutate({ email })',
      'vi.mocked(db.user.findUnique).mockResolvedValue(user)',
      'vi.spyOn(db.user, "findMany")',
      'const find = db.user.findMany',
      // Other models, and `user` properties that are not Prisma delegates.
      'db.account.findMany({ where: { userId } })',
      'db.session.findUnique({ where: { id } })',
      'db.users.findMany()',
      'db.userProfile.findMany()',
      'user.findMany()',
      'findMany()',
      'db.user',
      'session.user.name',
      'ctx.session.user.id',
      'db.user.fields',
      'db.user.toString()',
      'db[model].findMany()',
      'db[userKey].findMany()',
      'db.user[method]()',

      // --- Prisma `user` relation ---
      ...RELATION_CALLS.flatMap((call) =>
        ['include', 'select'].map(
          (key) =>
            `${call}({ ${key}: { user: { select: defaultUserSelect } } })`
        )
      ),
      'db.account.findMany({ include: { user: false } })',
      'db.user.findMany({ select: cond ? defaultUserSelect : { id: true } })',
      'db.account.findUnique({ where }).user({ select: defaultUserSelect })',
      'getSession().user()',
      'auth.current().user()',
      'db.account.findMany({ include: { user: { select: { id: true }, where } } })',
      'db.account.findMany({ include: { user: { ...rest, select: s } } })',
      'db.account.findMany({ select: { _count: { select: { user: true } } } })',
      'db.account.findMany({ include: { _count: { select: { user: true } } } })',
      'db.account.findMany({ where: { user: { email } } })',
      'db.account.findMany({ orderBy: { user: { name: "asc" } } })',
      'db.account.findMany({ include: { users: true } })',
      'db.account.findMany({ include: { owner: true } })',
      'const props = { user: true }',
      'const { select: { user } } = args',
      'const { include: { user } } = args',
      'return { session: { user } }',

      // --- Kysely ---
      "db.$kysely.selectFrom('User').select(['id', 'email']).execute()",
      "db.$kysely.selectFrom('User').select('id').executeTakeFirst()",
      "db.$kysely.insertInto('User').values(v).returning(['id']).execute()",
      "db.$kysely.updateTable('User').set(v).returning('id').execute()",
      "db.$kysely.deleteFrom('User').where('id', '=', id).execute()",
      "db.$kysely.selectFrom('Account').selectAll().execute()",
      "db.$kysely.deleteFrom('VerificationToken').where('identifier', '=', id).returningAll().executeTakeFirst()",
      "db.$kysely.selectFrom('Account').innerJoin('User', 'User.id', 'Account.userId').selectAll('Account').execute()",
      "db.$kysely.selectFrom('Account as a').innerJoin('User as u', 'u.id', 'a.userId').selectAll('a').execute()",
      "db.$kysely.selectFrom('Users').selectAll().execute()",
      "db.$kysely.selectFrom('UserProfile').selectAll().execute()",
      'db.$kysely.selectFrom(table).selectAll().execute()',
      'selectAll()',

      // --- Raw SQL ---
      'db.$queryRaw`SELECT 1`',
      'db.$queryRaw`SELECT id, email FROM "User"`',
      'db.$queryRaw`SELECT * FROM "Account"`',
      'db.$queryRaw`SELECT count(*) FROM "User"`',
      'db.$executeRaw`UPDATE "User" SET name = ${name} RETURNING id`',
      'db.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`)',
      'db.$executeRawUnsafe(migration)',
      'db.$queryRawUnsafe(\'SELECT id FROM "User"\')',
      'sql`SELECT id FROM "User"`',
      'html`SELECT * FROM "User"`',
      'log(`SELECT * FROM "User"`)',
    ],
  }
)
