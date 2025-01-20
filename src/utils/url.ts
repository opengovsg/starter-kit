import { type ParsedUrlQuery } from 'querystring'

import { REDIRECT_ROUTE_KEY } from '~/constants/params'
import { ALL_ROUTES } from '~/lib/routes'
import { routeKeySchema } from '~/schemas/url'

/**
 * Validates routeKey then adds it as a query param to the URL
 */
export const appendWithRedirectRouteKey = (
  url: string,
  route?: keyof typeof ALL_ROUTES,
) => {
  if (!route) return url
  // validate route
  route = routeKeySchema.parse(route)
  const query = new URLSearchParams({
    [REDIRECT_ROUTE_KEY]: route,
  })
  return `${url}?${query}`
}

/**
 * Extracts the routeKey from query param and validates it
 */
export const getRedirectRouteKey = (query: ParsedUrlQuery) => {
  return routeKeySchema.parse(query[REDIRECT_ROUTE_KEY])
}

/**
 * Resolve the routeKey to the actual route
 */
export const resolveRouteKey = (
  v: unknown,
): (typeof ALL_ROUTES)[keyof typeof ALL_ROUTES] => {
  return ALL_ROUTES[routeKeySchema.parse(v)]
}

/**
 * Convenience function to resolve redirect route from query param
 */
export const getRedirectRoute = (query: ParsedUrlQuery) => {
  return resolveRouteKey(getRedirectRouteKey(query))
}
