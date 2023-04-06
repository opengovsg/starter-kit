import type { NextPage } from 'next'
import type { ReactElement, ReactNode } from 'react'

export type NextPageWithLayout<
  TProps = Record<string, unknown>,
  TInitialProps = TProps
> = NextPage<TProps, TInitialProps> & {
  getLayout?: (page: ReactElement) => ReactNode
}

export * from './trpc'
