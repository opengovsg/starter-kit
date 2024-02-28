import { type ParsedUrlQuery } from 'querystring'
import { CALLBACK_URL_KEY } from '~/constants/params'

export const appendWithRedirect = (url: string, redirectUrl?: string) => {
  if (!redirectUrl || !isRelativeUrl(redirectUrl)) {
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

// Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
// Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
// Adapted from https://github.com/sindresorhus/is-absolute-url/blob/main/index.js
export const isRelativeUrl = (url: string) => {
  const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/
  const PROTOCOL_RELATIVE_URL_REGEX = /^\/\//

  // Windows paths like `c:\`
  const WINDOWS_PATH_REGEX = /^[a-zA-Z]:\\/

  if (WINDOWS_PATH_REGEX.test(url)) {
    return false
  }

  return !ABSOLUTE_URL_REGEX.test(url) && !PROTOCOL_RELATIVE_URL_REGEX.test(url)
}
