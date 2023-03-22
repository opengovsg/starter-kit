import { env } from '~/server/env';
import { SgidClient } from '@opengovsg/sgid-client';
import { getNextAuthBaseUrl } from '~/utils/getBaseUrl';
import { IronSessionOptions } from 'iron-session';

const SGID_REDIRECT_URI = `${getNextAuthBaseUrl()}/api/auth/callback/sgid`;

const SGID_CLIENT = new SgidClient({
  clientId: env.SGID_CLIENT_ID,
  clientSecret: env.SGID_CLIENT_SECRET,
  privateKey: env.SGID_PRIVATE_KEY,
  redirectUri: SGID_REDIRECT_URI,
  // The rest of the options are not required since they are already declared in NextAuth.
  // This client is solely used for token exchange and decryption.
});

export const sessionOptions: IronSessionOptions = {
  password: {
    '1': env.SESSION_SECRET,
  },
  cookieName: 'auth.session-token',
  ttl: 60 * 60 * 24 * 7, // 7 days
};

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma),
//   // Configure one or more authentication providers
//   providers: [
//     {
//       id: 'sgid',
//       name: 'SGID',
//       type: 'oauth',
//       wellKnown: 'https://api.id.gov.sg/.well-known/openid-configuration',
//       clientId: env.SGID_CLIENT_ID,
//       clientSecret: env.SGID_CLIENT_SECRET,
//       authorization: {
//         url: 'https://api.id.gov.sg/v1/oauth/authorize',
//         params: {
//           scope: 'openid myinfo.name myinfo.email',
//           redirect_uri: SGID_REDIRECT_URI,
//         },
//       },
//       token: {
//         request: async ({ params: { code } }) => {
//           if (!code) return { tokens: {} };
//           const tokens = await SGID_CLIENT.callback(code);
//           return {
//             tokens: {
//               access_token: tokens.accessToken,
//               // NextAuth expects an `id` key instead of the `sub` key to create
//               // the Account row in the database.
//               id: tokens.sub,
//             },
//           };
//         },
//       },
//       userinfo: {
//         url: 'https://api.id.gov.sg/v1/oauth/userinfo',
//         request: ({ tokens: { access_token } }) => {
//           if (!access_token) return {};
//           // Use SGID client to decrypt the userinfo response.
//           return SGID_CLIENT.userinfo(access_token);
//         },
//       },
//       profile(profile: Awaited<ReturnType<SgidClient['userinfo']>>) {
//         return {
//           id: profile.sub,
//           name: profile.data?.['myinfo.name'],
//           email: profile.data?.['myinfo.email'],
//         };
//       },
//     },
//   ],
//   callbacks: {
//     session: async ({ session, user }) => {
//       session.user.id = user.id;
//       return session;
//     },
//   },
//   pages: {
//     signIn: '/sign-in',
//   },
//   secret: env.NEXTAUTH_SECRET,
// };
