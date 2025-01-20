import {
  generatePkcePair,
  type AuthorizationUrlParams,
} from '@opengovsg/sgid-client'
import { TRPCError } from '@trpc/server'
import set from 'lodash/set'
import { z } from 'zod'

import { trpcAssert } from '~/utils/trpcAssert'
import {
  createResponseSchema,
  normaliseEmail,
  safeSchemaJsonParse,
} from '~/utils/zod'
import { SGID } from '~/lib/errors/auth.sgid'
import { APP_SGID_SCOPE, sgid } from '~/lib/sgid'
import { callbackUrlSchema } from '~/schemas/url'
import { publicProcedure, router } from '~/server/trpc'
import { upsertSgidAccountAndUser } from './sgid.service'
import {
  getUserInfo,
  sgidSessionProfileSchema,
  type SgidUserInfo,
} from './sgid.utils'

const sgidCallbackStateSchema = z.object({
  landingUrl: callbackUrlSchema,
})

export const sgidRouter = router({
  login: publicProcedure
    .input(sgidCallbackStateSchema)
    .mutation(async ({ ctx, input: { landingUrl } }) => {
      if (!sgid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'SGID is not enabled',
        })
      }
      if (!ctx.session) {
        // Redirect back to sign in page.
        throw new TRPCError({
          code: 'UNPROCESSABLE_CONTENT',
          message: 'Session object missing in context',
        })
      }

      ctx.logger.info({ landingUrl }, `Starting SGID login flow: ${landingUrl}`)

      const { codeChallenge, codeVerifier } = generatePkcePair()
      const options: AuthorizationUrlParams = {
        codeChallenge,
        state: JSON.stringify({ landingUrl }),
        scope: APP_SGID_SCOPE,
      }
      const { url, nonce } = sgid.authorizationUrl(options)

      // Reset session
      ctx.session.destroy()

      // Store the code verifier and nonce in the session to retrieve in the callback.
      set(ctx.session, 'sgid.sessionState', {
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
    .output(
      createResponseSchema(
        z.object({
          selectProfileStep: z.boolean(),
          landingUrl: callbackUrlSchema,
        }),
      ),
    )
    .query(async ({ ctx, input: { state, code } }) => {
      if (!sgid) {
        ctx.logger.error('SGID is not enabled')
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'SGID is not enabled',
        })
      }
      if (!ctx.session.sgid?.sessionState) {
        ctx.logger.warn('No sgid session state found')
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid login flow',
        })
      }
      const parsedState = safeSchemaJsonParse(sgidCallbackStateSchema, state)
      if (!parsedState.success) {
        ctx.logger.error(
          { state, error: parsedState.error },
          'Invalid SGID callback state',
        )
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid SGID callback state',
        })
      }

      const { codeVerifier, nonce } = ctx.session.sgid.sessionState
      ctx.session.destroy()
      let sgidUserInfo: SgidUserInfo

      try {
        sgidUserInfo = await getUserInfo({ code, codeVerifier, nonce })
      } catch {
        ctx.logger.warn({ state }, 'Unable to fetch user info from sgID')
        // Redirect back to sign in page with error.
        // TODO: Change this to throw an error instead, and then handle it in the client.
        return {
          success: false,
          reason: 'Something went wrong whilst fetching SGID user info',
        }
      }

      // Start processing sgid login
      const pocdexDetails = sgidUserInfo.data['pocdex.public_officer_details']
      // Handle case where no pocdex details
      trpcAssert(pocdexDetails.length > 0, {
        message: SGID.noPocdex,
        code: 'FORBIDDEN',
      })

      // Redirect user to choose a profile before logging in.
      const sgidProfileToStore = sgidSessionProfileSchema.safeParse({
        list: pocdexDetails,
        sub: sgidUserInfo.sub,
        name: sgidUserInfo.data['myinfo.name'],
        // expire profiles after 5 minutes to avoid situations where login-jacking when
        // the previous user navigated away without selecting a profile
        expiry: Date.now() + 1000 * 60 * 5, // 5 minutes
      })

      if (!sgidProfileToStore.success) {
        ctx.logger.warn(
          { error: sgidProfileToStore.error },
          'Unable to store sgid profile in session',
        )
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to store sgid profile in session',
        })
      }

      set(ctx.session, 'sgid.profiles', sgidProfileToStore.data)
      await ctx.session.save()
      return {
        success: true,
        data: {
          selectProfileStep: true,
          landingUrl: parsedState.data.landingUrl,
        },
      }
    }),
  listStoredProfiles: publicProcedure.query(({ ctx }) => {
    const profiles = ctx.session?.sgid?.profiles

    trpcAssert(profiles, {
      message: 'Error logging in via sgID: profile is invalid',
      code: 'BAD_REQUEST',
      logger: ctx.logger,
    })

    const hasExpired = profiles.expiry < Date.now()
    if (hasExpired) {
      ctx.session?.destroy()
    }

    trpcAssert(!hasExpired, {
      message: 'Error logging in via sgID: session has expired',
      code: 'BAD_REQUEST',
      logger: ctx.logger,
    })

    return profiles.list
  }),
  selectProfile: publicProcedure
    .input(
      z.object({
        email: normaliseEmail,
      }),
    )
    .mutation(async ({ ctx, input: { email } }) => {
      trpcAssert(ctx.session, {
        message: 'Session object missing in context',
        code: 'UNPROCESSABLE_CONTENT',
        logger: ctx.logger,
      })

      const profiles = ctx.session.sgid?.profiles
      trpcAssert(profiles, {
        message: 'Error logging in via sgID: profile is invalid',
        code: 'BAD_REQUEST',
        logger: ctx.logger,
      })

      // Clear session once profile is retrieved, everything else is not needed.
      ctx.session.destroy()

      const hasProfile = profiles.list.some(
        ({ work_email }) =>
          work_email && normaliseEmail.parse(work_email) === email,
      )
      trpcAssert(hasProfile, {
        message: 'Error logging in via sgID: selected profile is invalid',
        code: 'BAD_REQUEST',
        logger: ctx.logger,
      })

      // Profile is valid, set on session
      const user = await upsertSgidAccountAndUser({
        prisma: ctx.prisma,
        name: profiles.name,
        pocdexEmail: email,
        sub: profiles.sub,
      })

      ctx.session.userId = user.id
      await ctx.session.save()
      return
    }),
})
