import { router, publicProcedure, protectedProcedure } from 'src/server/trpc';
import { z } from 'zod';
import { createHash } from '~/lib/createHash';
import { sendMail } from '~/lib/mail';
import { env } from '~/server/env';
import { getBaseUrl } from '~/utils/getBaseUrl';

export const createVfnToken = () => {
  const random = crypto.getRandomValues(new Uint8Array(8));
  return Buffer.from(random).toString('hex').slice(0, 6);
};

export const emailSessionRouter = router({
  user: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session.user;
  }),
  // Generate OTP.
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input: { email } }) => {
      const expires = new Date(Date.now() + env.OTP_EXPIRY * 1000);
      const token = await createHash(
        `${createVfnToken()}${env.OTP_HASH_SECRET}`,
      );

      const url = new URL(getBaseUrl());

      await Promise.all([
        sendMail({
          subject: `Sign in to ${url.host}`,
          body: `Your OTP is <b>${token}</b>. It will expire on ${expires}.
      Please use this to login to your account.
      <p>If your OTP does not work, please request for a new one.</p>`,
          recipient: email,
        }),
        ctx.prisma.verificationToken.create({
          data: {
            identifier: email,
            token,
            expires,
          },
        }),
      ]);
      return true;
    }),
  logout: publicProcedure.mutation(async ({ ctx }) => {
    ctx.session?.destroy();
    return { isLoggedIn: false, login: '', avatarUrl: '' };
  }),
});
