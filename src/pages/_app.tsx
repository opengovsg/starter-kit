import '@fontsource/ibm-plex-mono'; // Import if using code textStyles.
import 'inter-ui/inter.css'; // Strongly recommended.

import { ThemeProvider } from '@opengovsg/design-system-react';
import { SessionProvider, signIn, useSession } from 'next-auth/react';
import type { AppProps, AppType } from 'next/app';
import { PropsWithChildren, useEffect } from 'react';
import { DefaultLayout } from '~/templates/layouts/DefaultLayout';
import { NextPageWithAuthAndLayout } from '~/lib/types';
import { trpc } from '~/utils/trpc';
import { theme } from '~/theme';
import { isAfter } from 'date-fns';

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
      <ThemeProvider theme={theme}>
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

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading

    const interval = setInterval(() => {
      if (
        !session?.user ||
        (session && isAfter(new Date(), new Date(session.expires)))
      ) {
        signIn(undefined, {
          callbackUrl: '/dashboard',
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, status]);

  if (session) {
    return <>{children}</>;
  }

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return null;
};

export default trpc.withTRPC(MyApp);
