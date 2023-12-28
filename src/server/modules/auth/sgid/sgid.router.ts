import {
  type AuthorizationUrlParams,
  generatePkcePair,
} from '@opengovsg/sgid-client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { APP_SGID_SCOPE, sgid } from '~/lib/sgid'
import { publicProcedure, router } from '~/server/trpc'
import { getUserInfo, type SgidUserInfo } from './sgid.utils'
import { env } from '~/env.mjs'
import { HOME, SIGN_IN, SIGN_IN_SELECT_PROFILE_SUBROUTE } from '~/lib/routes'
import { generateUsername } from '../../me/me.service'
import { set } from 'lodash'
import { normaliseEmail, safeSchemaJsonParse } from '~/utils/zod'
import { appendWithRedirect } from '~/utils/url'
import { createPocdexAccountProviderId } from '../auth.util'
import { AccountProvider } from '../auth.constants'

const sgidCallbackStateSchema = z.object({
  landingUrl: z.string(),
})

export const sgidRouter = router({
  login: publicProcedure
    .input(
      z.object({
        landingUrl: z.string().optional().default(HOME),
      })
    )
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
      })
    )
    .query(async ({ ctx, input: { state, code } }) => {
      if (!env.NEXT_PUBLIC_ENABLE_SGID) {
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
          'Invalid SGID callback state'
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
      } catch (error) {
        ctx.logger.warn({ state }, 'Unable to fetch user info from sgID')
        // Redirect back to sign in page with error.
        // TODO: Change this to throw an error instead, and then handle it in the client.
        return {
          redirectUrl: `/sign-in?error=${
            (error as Error).message ||
            'Something went wrong whilst fetching SGID user info'
          }`,
        }
      }

      // Start processing sgid login
      const pocdexDetails = sgidUserInfo.data['pocdex.public_officer_details']
      // Handle case where no pocdex details
      if (pocdexDetails.length === 0) {
        return {
          redirectUrl: `/sign-in?error=${'You do not have a valid government email address. Please log in with the email method instead.'}`,
        }
      }

      // More than 1 domain means that the user has multiple profiles
      // Redirect user to choose a profile before logging in.
      if (pocdexDetails.length > 1) {
        set(ctx.session, 'sgid.profiles', {
          list: pocdexDetails,
          // expire profiles after 5 minutes to avoid situations where login-jacking when
          // the previous user navigated away without selecting a profile
          expiry: Date.now() + 1000 * 60 * 5, // 5 minutes
        })
        await ctx.session.save()
        return {
          selectProfileStep: true,
          redirectUrl: appendWithRedirect(
            `${SIGN_IN}${SIGN_IN_SELECT_PROFILE_SUBROUTE}`,
            parsedState.data.landingUrl
          ),
        }
      }

      // Exactly 1 email, create user and tie to account
      const sgidPocdexEmailResult = normaliseEmail.safeParse(
        pocdexDetails[0]?.work_email
      )
      if (!sgidPocdexEmailResult.success) {
        ctx.logger.warn(
          { error: sgidPocdexEmailResult.error },
          'Unable to process work email from sgID'
        )
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Work email was unable to be processed. Please try again.',
        })
      }
      const sgidPocdexEmail = sgidPocdexEmailResult.data
      const user = await ctx.prisma.$transaction(async (tx) => {
        // Create user from email
        const user = await tx.user.upsert({
          where: {
            email: sgidPocdexEmail,
          },
          update: {},
          create: {
            email: sgidPocdexEmail,
            emailVerified: new Date(),
            name: sgidUserInfo.data['myinfo.name'],
            username: generateUsername(sgidPocdexEmail),
          },
        })

        // Backwards compatibility -- update username if it is not set
        if (!user.username) {
          await tx.user.update({
            where: { id: user.id },
            data: { username: generateUsername(sgidPocdexEmail) },
          })
        }

        // Link user to account
        const pocdexProviderAccountId = createPocdexAccountProviderId(
          sgidUserInfo.sub,
          sgidPocdexEmail
        )
        await ctx.prisma.accounts.upsert({
          where: {
            provider_providerAccountId: {
              provider: AccountProvider.SgidPocdex,
              providerAccountId: pocdexProviderAccountId,
            },
          },
          update: {},
          create: {
            provider: AccountProvider.SgidPocdex,
            providerAccountId: pocdexProviderAccountId,
            userId: user.id,
          },
        })

        return user
      })

      ctx.session.destroy()
      ctx.session.userId = user.id
      await ctx.session.save()

      return {
        redirectUrl: parsedState.data.landingUrl,
      }
    }),
})
