export const SIGN_IN = '/sign-in'
export const SIGN_IN_SELECT_PROFILE = '/sign-in/select-profile'

export const HOME = '/home'
export const PROFILE = '/profile'
export const SETTINGS_PROFILE = '/settings/profile'

export const ALLOWED_CALLBACK_ROUTES = [
  SIGN_IN,
  SIGN_IN_SELECT_PROFILE,
  HOME,
  PROFILE,
  SETTINGS_PROFILE,
] as const

export type CallbackRoute = (typeof ALLOWED_CALLBACK_ROUTES)[number]
