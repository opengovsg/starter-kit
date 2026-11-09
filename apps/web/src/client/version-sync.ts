/**
 * Client/server `X-App-Version` mismatch — block tRPC writes until a full reload
 * loads a JS bundle that matches the server.
 */
let updateRequired = false

export const markUpdateRequired = () => {
  updateRequired = true
}

export const isUpdateRequired = () => updateRequired

const isWriteMethod = (method: string | undefined) => {
  const normalized = method?.toUpperCase() ?? 'GET'
  return normalized !== 'GET' && normalized !== 'HEAD'
}

export const assertClientMayWrite = (method: string | undefined) => {
  if (isUpdateRequired() && isWriteMethod(method)) {
    throw new Error(
      'This app is out of date. Refresh the page to continue making changes.'
    )
  }
}
