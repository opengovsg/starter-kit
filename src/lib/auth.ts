import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import { prisma } from '~/server/prisma';
import GitHubProvider from 'next-auth/providers/github';
import { env } from '~/server/env';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // Configure one or more authentication providers
  providers: [
    GitHubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    session: ({ session, user }) => {
      session.user.id = user.id;
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
  secret: env.NEXTAUTH_SECRET,
};
