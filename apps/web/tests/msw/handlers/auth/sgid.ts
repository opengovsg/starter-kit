import { delay } from 'msw'

import { trpcMsw } from '~tests/msw/mockTrpc'

export const authSgidHandlers = {
  listStoredProfiles: {
    loading: () => {
      return trpcMsw.auth.sgid.listStoredProfiles.query(async () => {
        await delay('infinite')
        return []
      })
    },
    returnSingleProfile: () => {
      return trpcMsw.auth.sgid.listStoredProfiles.query(() => {
        return [
          {
            work_email: 'test@example.com',
            agency_name: 'Test Government Agency',
            department_name: 'Test Government Products Special Team',
            employment_type: 'Permanent',
            employment_title: 'Boss',
          },
        ]
      })
    },
    returnMultipleProfiles: () => {
      return trpcMsw.auth.sgid.listStoredProfiles.query(() => {
        return [
          {
            work_email: 'test_boss@example.com',
            agency_name: 'Test Government Agency',
            department_name: 'Test Government Products Special Team',
            employment_type: 'Permanent',
            employment_title: 'Boss',
          },
          {
            work_email: 'test_minion@example.com',
            agency_name: 'Another Government Agency',
            department_name: 'Another Government Products Super Special Team',
            employment_type: 'Contract',
            employment_title: 'Minion',
          },
        ]
      })
    },
  },
}
