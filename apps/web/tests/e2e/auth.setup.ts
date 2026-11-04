import { test as setup } from '@playwright/test'

import { ROLES, roleTag } from './fixtures/auth'
import { mintStorageState } from './setup/session'

// One setup test per role, tagged like the tests that need it. Each
// `setup:<role>` project picks its own by that tag (see playwright.config.ts).
for (const role of ROLES) {
  setup(`sign in as ${role}`, { tag: roleTag(role) }, async ({ baseURL }) => {
    if (baseURL === undefined) {
      throw new Error('auth.setup.ts needs `use.baseURL`')
    }

    await mintStorageState({ baseURL, role })
  })
}
