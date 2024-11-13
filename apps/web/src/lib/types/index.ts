import type { ReactNode } from 'react'
import type { NextPage } from 'next'

export type GetLayout = (page: ReactNode) => ReactNode

export type NextPageWithLayout<
  TProps = Record<string, unknown>,
  TInitialProps = TProps,
> = NextPage<TProps, TInitialProps> & {
  getLayout?: GetLayout
}
