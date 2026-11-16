import { expect, test as setup } from '@playwright/test'

import { ROLES, roleTag } from './fixtures/auth'
import { mintStorageState } from './setup/session'

for (const role of ROLES) {
  setup(`sign in as ${role}`, { tag: roleTag(role) }, async ({ baseURL }) => {
    expect(baseURL).toBeDefined()
    await mintStorageState({ baseURL: `${baseURL}`, role })
  })
}
