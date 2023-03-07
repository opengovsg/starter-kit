import '@fontsource/ibm-plex-mono'; // Import if using code textStyles.
import 'inter-ui/inter.css'; // Strongly recommended.

import { ThemeProvider } from '@opengovsg/design-system-react';
import { SessionProvider, signIn, useSession } from 'next-auth/react';
import type { AppProps, AppType } from 'next/app';
import { PropsWithChildren, useEffect } from 'react';
import { DefaultLayout } from '~/components/DefaultLayout';
import { NextPageWithAuthAndLayout } from '~/lib/types';
import { trpc } from '~/utils/trpc';

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
