import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';

export type NextPageWithAuthAndLayout<
  TProps = Record<string, unknown>,
  TInitialProps = TProps,
> = NextPage<TProps, TInitialProps> & {
  auth?: boolean;
  getLayout?: (page: ReactElement) => ReactNode;
};
