// This file allows us to pass in environment variables to our app.
// Used to allow overriding of environment variables in storybook tests.
import { createContext, type PropsWithChildren } from 'react'

import { type env } from '~/env.mjs'

// Typescript magic to only select keys from object T that start with a prefix S.
type PickStartsWith<T extends object, S extends string> = {
  [K in keyof T as K extends `${S}${string}` ? K : never]: T[K]
}

export interface EnvContextReturn {
  env: PickStartsWith<typeof env, 'NEXT_PUBLIC'>
}

export const EnvContext = createContext<EnvContextReturn | undefined>(undefined)

export const EnvProvider = ({
  children,
  env,
}: PropsWithChildren<EnvContextReturn>): JSX.Element => {
  return <EnvContext.Provider value={{ env }}>{children}</EnvContext.Provider>
}
