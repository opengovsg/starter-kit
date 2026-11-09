import type { Prisma } from '@acme/db/client'

/**
 * Default selector for when retrieving user fields.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information.
 * Linted by `acme/require-explicit-user-columns` (syntax only; aliased or dynamically built queries can slip past).
 * @see https://github.com/prisma/prisma/issues/9353
 */
export const defaultUserSelect = {
  email: true,
  id: true,
  image: true,
  name: true,
} satisfies Prisma.UserSelect
