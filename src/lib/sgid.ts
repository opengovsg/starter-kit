import SgidClient, { type SgidClientParams } from '@opengovsg/sgid-client'
import { env } from '~/env.mjs'
import { getBaseUrl } from '~/utils/getBaseUrl'

const sgidOptions = {
  clientId: env.SGID_CLIENT_ID,
  clientSecret: env.SGID_CLIENT_SECRET,
  privateKey: env.SGID_PRIVATE_KEY,
  // Client requires at least a default uri to be registered
  redirectUri: env.SGID_REDIRECT_URI ?? `${getBaseUrl()}/sign-in/sgid/callback`,
} as SgidClientParams

export const sgid = new SgidClient(sgidOptions)
