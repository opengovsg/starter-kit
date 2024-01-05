import isEmail from 'validator/lib/isEmail'

export const getEmailDomain = (email?: string) => {
  if (!email) {
    return undefined
  }
  if (!isEmail(email)) {
    return undefined
  }
  return email.split('@').pop()
}

/**
 * Returns whether the passed value is a valid government email.
 */
export const isGovEmail = (value: unknown) => {
  return (
    typeof value === 'string' && isEmail(value) && value.endsWith('.gov.sg')
  )
}
