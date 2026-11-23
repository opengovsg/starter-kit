import { eslintCompatPlugin } from '@oxlint/plugins'

import { e2eFilenameRule } from './rules/e2e/e2e-filename.ts'
import { noE2eDbWritesRule } from './rules/e2e/no-e2e-db-writes.ts'
import { noE2eLateClockInstallRule } from './rules/e2e/no-e2e-late-clock-install.ts'
import { noE2eLiteralRoleTagRule } from './rules/e2e/no-e2e-literal-role-tag.ts'
import { noE2ePageRouteRule } from './rules/e2e/no-e2e-page-route.ts'
import { noE2eStorageStateRule } from './rules/e2e/no-e2e-storage-state.ts'
import { requireE2ePoExpectScanRule } from './rules/e2e/require-e2e-po-expect-scan.ts'
import { requireDefineAcmeConfigRule } from './rules/require-define-acme-config.ts'
import { requireExplicitUserColumnsRule } from './rules/require-explicit-user-columns.ts'

export default eslintCompatPlugin({
  meta: { name: 'acme' },
  rules: {
    'e2e-filename': e2eFilenameRule,
    'no-e2e-db-writes': noE2eDbWritesRule,
    'no-e2e-late-clock-install': noE2eLateClockInstallRule,
    'no-e2e-literal-role-tag': noE2eLiteralRoleTagRule,
    'no-e2e-page-route': noE2ePageRouteRule,
    'no-e2e-storage-state': noE2eStorageStateRule,
    'require-e2e-po-expect-scan': requireE2ePoExpectScanRule,
    'require-define-acme-config': requireDefineAcmeConfigRule,
    'require-explicit-user-columns': requireExplicitUserColumnsRule,
  },
})
