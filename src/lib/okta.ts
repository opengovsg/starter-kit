import { Issuer } from 'openid-client'
import { env } from '~/env.mjs'

const oktaIssuer = await Issuer.discover(env.OKTA_CONFIGURATION_URL)
export const okta = new oktaIssuer.Client({
  client_id: env.OKTA_CLIENT_ID,
  client_secret: env.OKTA_CLIENT_SECRET,
  redirect_uris: [env.OKTA_REDIRECT_URI],
  response_types: ['code'],
})
