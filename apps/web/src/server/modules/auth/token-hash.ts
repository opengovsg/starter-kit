import { scryptSync } from 'node:crypto'

export const hashToken = (token: string, identifier: string) =>
  scryptSync(token, identifier, 64).toString('base64')
