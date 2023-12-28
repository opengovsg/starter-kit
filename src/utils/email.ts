import validator from 'validator'

export const getEmailDomain = (email?: string) => {
  if (!email) {
    return undefined
  }
  const isEmail = validator.isEmail(email)
  if (!isEmail) {
    return undefined
  }
  return email.split('@').pop()
}
