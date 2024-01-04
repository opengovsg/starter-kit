import { type ParsedUrlQuery } from 'querystring'
import { CALLBACK_URL_KEY } from '~/constants/params'

export const appendWithRedirect = (url: string, redirectUrl?: string) => {
  if (!redirectUrl) {
    return url
  }
  return `${url}?${CALLBACK_URL_KEY}=${redirectUrl}`
}

export const getRedirectUrl = (query: ParsedUrlQuery) => {
  if (!query[CALLBACK_URL_KEY]) {
    return undefined
  }
  return decodeURIComponent(String(query[CALLBACK_URL_KEY]))
}
