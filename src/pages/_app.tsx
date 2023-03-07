import 'inter-ui/inter.css'; // Strongly recommended.
import '@fontsource/ibm-plex-mono'; // Import if using code textStyles.

import type { NextPage } from 'next';
import type { AppType, AppProps } from 'next/app';
import { PropsWithChildren, ReactElement, ReactNode, useEffect } from 'react';
import { DefaultLayout } from '~/components/DefaultLayout';
import { trpc } from '~/utils/trpc';
import { ThemeProvider } from '@opengovsg/design-system-react';
import { SessionProvider, signIn, useSession } from 'next-auth/react';
import { NextPageWithAuthAndLayout } from '~/lib/types';

export type NextPageWithLayout<
  TProps = Record<string, unknown>,
  TInitialProps = TProps,
> = NextPage<TProps, TInitialProps> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithAuthAndLayout = AppProps & {
  Component: NextPageWithAuthAndLayout;
};

const MyApp = (({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithAuthAndLayout) => {
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <ThemeProvider>
        {Component.auth ? (
          <Auth>{getLayout(<Component {...pageProps} />)}</Auth>
        ) : (
          getLayout(<Component {...pageProps} />)
        )}
      </ThemeProvider>
    </SessionProvider>
  );
}) as AppType;

const Auth = ({ children }: PropsWithChildren) => {
  const { data: session, status } = useSession();
  const isUser = !!session?.user;

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (!isUser) signIn(); // If not authenticated, force log in
  }, [isUser, status]);

  if (isUser) {
    return <>{children}</>;
  }

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return null;
};

export default trpc.withTRPC(MyApp);
