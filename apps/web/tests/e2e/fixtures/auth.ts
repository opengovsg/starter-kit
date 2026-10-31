import { fileURLToPath } from 'node:url'

// One Playwright project per role (see playwright.config.ts). Add roles here
// as the app grows; each gets a seeded user and a pre-signed-in cookie jar.
// `otherUser` is a second account for authorization tests (user A must not
// see user B's data).
export const ROLES = ['user', 'otherUser'] as const

export type Role = (typeof ROLES)[number]

export const TEST_EMAILS: Record<Role, string> = {
  otherUser: 'other-user@e2e.gov.sg',
  user: 'user@e2e.gov.sg',
}

/** Tag a `test.describe` to run it under that role's project. Typed so unknown roles fail typecheck. */
export const roleTag = <R extends Role>(role: R): `@role:${R}` =>
  `@role:${role}`

// Gitignored; written by global-setup.ts on every run.
export const storageStateFor = (role: Role) =>
  fileURLToPath(new URL(`../.auth/${role}.json`, import.meta.url))
