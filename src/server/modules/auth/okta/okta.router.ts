import { TRPCError } from '@trpc/server'
import set from 'lodash/set'
import { z } from 'zod'
import { appendWithRedirect } from '~/utils/url'
import { safeSchemaJsonParse } from '~/utils/zod'
import { HOME } from '~/lib/routes'
import { callbackUrlSchema } from '~/schemas/url'
import { publicProcedure, router } from '~/server/trpc'
import { generators } from 'openid-client'
import { okta } from '~/lib/okta'
import { env } from '~/env.mjs'
import { defaultMeSelect } from '~/server/modules/me/me.select'

const callbackStateSchema = z.object({
  landingUrl: z.string(),
})

export const oktaRouter = router({
  login: publicProcedure
    .input(
      z.object({
        landingUrl: callbackUrlSchema,
      }),
    )
    .mutation(async ({ ctx, input: { landingUrl } }) => {
      if (!ctx.session) {
        // Redirect back to sign in page.
        throw new TRPCError({
          code: 'UNPROCESSABLE_CONTENT',
          message: 'Session object missing in context',
        })
      }

      const nonce = generators.nonce()
      const codeVerifier = generators.codeVerifier()
      const codeChallenge = generators.codeChallenge(codeVerifier)

      const url = okta.authorizationUrl({
        scope: 'openid email profile',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: JSON.stringify({ landingUrl }),
        nonce: nonce,
      })

      // Reset session
      ctx.session.destroy()

      // Store the code verifier and nonce in the session to retrieve in the callback.
      set(ctx.session, 'okta.sessionState', {
        codeVerifier,
        nonce,
      })
      await ctx.session.save()

      return {
        redirectUrl: url,
      }
    }),
  callback: publicProcedure
    .input(
      z.object({
        state: z.string(),
        code: z.string(),
      }),
    )
    .query(async ({ ctx, input: { state, code } }) => {
      if (!ctx.session.okta?.sessionState) {
        ctx.logger.warn('No okta session state found')
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid login flow',
        })
      }

      const parsedState = safeSchemaJsonParse(callbackStateSchema, state)
      if (!parsedState.success) {
        ctx.logger.error(
          { state, error: parsedState.error },
          'Invalid callback state',
        )
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid callback state',
        })
      }

      const { codeVerifier, nonce } = ctx.session.okta.sessionState
      ctx.session.destroy()

      const token = await okta.callback(
        env.OKTA_REDIRECT_URI,
        { code },
        { code_verifier: codeVerifier, nonce: nonce },
      )

      const { email, name, sub } = token.claims()

      const user = await ctx.prisma.$transaction(async (tx) => {
        const user = await tx.user.upsert({
          where: { email },
          update: {},
          create: {
            email: email!,
            name,
          },
          select: defaultMeSelect,
        })

        await tx.accounts.upsert({
          where: {
            provider_providerAccountId: {
              provider: 'okta',
              providerAccountId: sub,
            },
          },
          update: {},
          create: {
            provider: 'okta',
            providerAccountId: sub,
            userId: user.id,
          },
        })
        return user
      })

      ctx.session.userId = user.id

      await ctx.session.save()
      return {
        redirectUrl: appendWithRedirect(HOME, parsedState.data.landingUrl),
      }
    }),
})
