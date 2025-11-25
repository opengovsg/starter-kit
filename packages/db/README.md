# @acme/db

A type-safe database package built with Prisma, Kysely, and PostgreSQL. This package provides a unified database client with support for both ORM-style queries (Prisma) and SQL query building (Kysely).

## Features

- **Prisma ORM** - Type-safe database access with intuitive API
- **Kysely Integration** - Advanced SQL query building capabilities
- **Zod Schema Generation** - Auto-generated Zod schemas for validation
- **PostgreSQL** - Built for PostgreSQL databases
- **Type Safety** - Full TypeScript support with generated types
- **Environment Validation** - Type-safe environment variable handling

## Database Schema

The database includes three main models:

- **User** - User accounts with email, name, and image
- **Account** - OAuth provider accounts linked to users
- **VerificationToken** - Email verification tokens with rate limiting

## Installation

This package is part of a monorepo and is not meant to be installed independently. Import it from other packages in the workspace:

```typescript
import { db } from '@acme/db'
```

## Setup

### 1. Configure Environment Variables

Create a `.env` file in the root of your monorepo with your database URL (you can do this by copying the existing `.env.example`):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
```

### 2. Generate Prisma Client

```bash
pnpm generate
```

This generates:

- Prisma Client
- Kysely types
- Zod schemas

This auto-runs before `npm run dev`

### 3. Run Migrations

```bash
# Development
pnpm migrate:dev

# Production
pnpm migrate:deploy
```

## Usage

### Basic Queries with Prisma

```typescript
import { db } from '@acme/db'

// Create a user
const user = await db.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    image: 'https://example.com/avatar.jpg',
  },
})

// Find a user
const user = await db.user.findUnique({
  where: { email: 'user@example.com' },
  include: { accounts: true },
})

// Update a user
const updatedUser = await db.user.update({
  where: { id: 'user-id' },
  data: { name: 'Jane Doe' },
})

// Delete a user
await db.user.delete({
  where: { id: 'user-id' },
})
```

### Advanced Queries with Kysely

The database client is extended with Kysely for complex SQL queries:

```typescript
import { db } from '@acme/db'

// Use Kysely for complex queries
const users = await db.$kysely
  .selectFrom('User')
  .select(['id', 'email', 'name'])
  .where('email', 'like', '%@example.com')
  .orderBy('name', 'asc')
  .execute()

// Joins and aggregations
const userAccounts = await db.$kysely
  .selectFrom('User')
  .innerJoin('Account', 'Account.user_id', 'User.id')
  .select(['User.email', 'Account.provider'])
  .execute()

// Complex filtering
const activeUsers = await db.$kysely
  .selectFrom('User')
  .select(['id', 'email'])
  .where(({ eb, or }) =>
    or([
      eb('email', 'like', '%@gmail.com'),
      eb('email', 'like', '%@yahoo.com'),
    ]),
  )
  .execute()
```

### Using Zod Schemas for Validation

Generated Zod schemas are available for runtime validation:

```typescript
import { UserCreateSchema } from '@acme/db/generated/zod'

// Validate user input
const result = UserCreateSchema.safeParse({
  email: 'user@example.com',
  name: 'John Doe',
})

if (result.success) {
  const user = await db.user.create({
    data: result.data,
  })
}
```

### Transactions

```typescript
import { db } from '@acme/db'

// Prisma transactions
const result = await db.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: 'user@example.com' },
  })

  const account = await tx.account.create({
    data: {
      userId: user.id,
      provider: 'google',
      providerAccountId: 'google-id',
    },
  })

  return { user, account }
})

// Interactive transactions with timeout
const result = await db.$transaction(
  async (tx) => {
    // Your transaction logic
  },
  {
    maxWait: 5000, // 5 seconds
    timeout: 10000, // 10 seconds
  },
)

// Kysely transactions
We are not supposed to use `db.$kysely.transaction()` directly as it is not supported by the extension. Instead, use Prisma transactions as shown above.
```

### Raw SQL Queries

```typescript
import { db } from '@acme/db'

// Execute raw SQL
const users = await db.$queryRaw`
  SELECT * FROM "User" WHERE email LIKE ${pattern}
`

// Execute raw SQL without returning data
await db.$executeRaw`
  UPDATE "User" SET name = ${newName} WHERE id = ${userId}
`

Prisma\'s `queryRaw` and `executeRaw` template strings automatically escapes to prevent SQL injection. To leverage on this feature, **DO NOT** build your queries up piece meal but pass the full query in here, with string parameters (`${your_parameter}`) as needed
```

## Available Scripts

```bash
# Generate Prisma Client, Kysely types, and Zod schemas
pnpm generate

# Open Prisma Studio (database GUI on port 5556). This is also available at root as `pnpm db:studio`
pnpm studio

# Push schema changes to database (development only). This is also available at root as `pnpm db:push`
pnpm push

# Create a new migration
pnpm migrate:dev

# Apply migrations (production)
pnpm migrate:deploy

# Reset database and run migrations
pnpm reset

# Seed database
pnpm seed

# Build TypeScript
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format checking
pnpm format
```

## Package Exports

### Default Export (`@acme/db`)

```typescript
import { db, Prisma, PrismaClient } from '@acme/db'
```

- `db` - Main database client (Prisma with Kysely extension)
- `Prisma` - Prisma namespace for types
- `PrismaClient` - Raw Prisma client type

### Client Export (`@acme/db/client`)

```typescript
import { PrismaClient } from '@acme/db/client'
```

Raw PrismaClient exports, mainly for testing purposes.

### Browser Export (`@acme/db/browser`)

```typescript
import { Prisma } from '@acme/db/browser'
```

Browser-compatible Prisma types (no actual database connection).

### Enums Export (`@acme/db/enums`)

```typescript
import { QueryMode, SortOrder } from '@acme/db/enums'
```

Prisma-generated enums for use in queries.

## Development Workflow

### Adding a New Model

1. Update `prisma/schema.prisma` with your new model
2. Generate migration: `pnpm migrate:dev --name add_new_model`
3. Regenerate types: `pnpm generate`
4. The generated types will be available automatically

### Modifying Existing Models

1. Update the model in `prisma/schema.prisma`
2. Create migration: `pnpm migrate:dev --name describe_change`
3. Regenerate types: `pnpm generate`

### Seeding Data

Edit `prisma/seed.ts` and add your seed data:

```typescript
import { db } from '../src/index'

async function main() {
  await db.user.createMany({
    data: [
      { email: 'user1@example.com', name: 'User 1' },
      { email: 'user2@example.com', name: 'User 2' },
    ],
  })
}
```

Run the seed:

```bash
pnpm seed
```

## Type Safety

All operations are fully type-safe:

```typescript
// TypeScript will enforce correct field names and types
const user = await db.user.create({
  data: {
    email: 'user@example.com', // string
    name: 'John', // string | null
    // TypeScript error if you add unknown fields
  },
})

// Kysely queries are also type-safe
const result = await db.$kysely
  .selectFrom('User')
  .select(['id', 'email']) // Only valid columns are allowed
  .execute()
```

## Best Practices

2. **Leverage Kysely for Complex Queries** - Use Kysely for queries that are difficult to express with Prisma
3. **Use Generated Zod Schemas** - Validate external input before passing to database
4. **Index Frequently Queried Fields** - Add indexes in your schema for better performance
5. **Use Connection Pooling** - The package uses PrismaPg adapter with connection pooling built-in

## Troubleshooting

### Prisma Client Not Found

Run `pnpm generate` to generate the Prisma Client.

### Migration Errors

If migrations fail, you can reset the database:

```bash
pnpm reset
```

**Warning**: This will delete all data.

### Type Errors After Schema Changes

After modifying the schema, always run:

```bash
pnpm generate
```

This regenerates all types and ensures TypeScript has the latest schema information.

### Generation Errors

If `pnpm generate` fails, ensure your `schema.prisma` is valid and that your database is reachable. If you have modified the list of plugins recently, delete the `src/generated` folder and try again.

## Links

- [Prisma Documentation](https://www.prisma.io/docs)
- [Kysely Documentation](https://kysely.dev/)
- [Zod Documentation](https://zod.dev/)
