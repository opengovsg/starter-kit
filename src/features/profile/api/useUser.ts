import { useCallback, useEffect } from 'react';
import Router from 'next/router';
import { trpc } from '~/utils/trpc';

export const useUser = ({ redirectTo = '', redirectIfFound = false } = {}) => {
  const { data: user, isFetching, ...rest } = trpc.me.get.useQuery();

  useEffect(() => {
    // if no redirect needed, just return (example: already on /dashboard)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || isFetching) return;

    const shouldRedirect =
      // If redirectTo is set,
      redirectTo &&
      // redirect if the user was not found.
      ((!redirectIfFound && !user) ||
        // If redirectIfFound is also set, redirect if the user was found
        (redirectIfFound && user));

    if (shouldRedirect) {
      Router.push(redirectTo);
    }
  }, [user, redirectIfFound, redirectTo, isFetching]);

  const logoutMutation = trpc.session.logout.useMutation();

  const logout = useCallback(
    (redirectToSignIn = true) => {
      return logoutMutation.mutate(undefined, {
        onSuccess: () => {
          if (redirectToSignIn) Router.push('/sign-in');
        },
      });
    },
    [logoutMutation],
  );

  return { user, isFetching, ...rest, logout };
};
