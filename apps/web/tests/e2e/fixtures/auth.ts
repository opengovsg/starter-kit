import { fileURLToPath } from 'node:url'

export const ROLES = ['user', 'otherUser'] as const

export type Role = (typeof ROLES)[number]

export const TEST_EMAILS: Record<Role, string> = {
  otherUser: 'other-user@e2e.gov.sg',
  user: 'user@e2e.gov.sg',
}

export const roleTag = <R extends Role>(role: R): `@role:${R}` =>
  `@role:${role}`

export const storageStateFor = (role: Role) =>
  fileURLToPath(new URL(`../.auth/${role}.json`, import.meta.url))
