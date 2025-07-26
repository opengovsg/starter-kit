import { type ParsedUrlQuery } from 'querystring'

import { CALLBACK_URL_KEY } from '~/constants/params'
import { type CallbackRoute } from '~/lib/routes'
import { callbackUrlSchema } from '~/schemas/url'

/**
 * Validates redirectUrl then adds it as a query param to the URL
 */
export const appendWithRedirect = (
  url: string,
  redirectUrl?: CallbackRoute,
) => {
  if (!redirectUrl) return url
  // validate route
  redirectUrl = callbackUrlSchema.parse(redirectUrl)
  const query = new URLSearchParams({
    [CALLBACK_URL_KEY]: redirectUrl,
  })
  return `${url}?${query}`
}

/**
 * Extracts the redirectUrl from query param and validates it
 */
export const getRedirectUrl = (query: ParsedUrlQuery) => {
  return callbackUrlSchema.parse(query[CALLBACK_URL_KEY])
}
