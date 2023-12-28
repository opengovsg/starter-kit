export const appendWithRedirect = (url: string, redirectUrl?: string) => {
  if (!redirectUrl) {
    return url
  }
  return `${url}?redirectUrl=${redirectUrl}`
}
