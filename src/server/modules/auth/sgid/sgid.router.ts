import {
  type AuthorizationUrlParams,
  generatePkcePair,
} from '@opengovsg/sgid-client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { env } from '~/env.mjs'
import { sgid } from '~/lib/sgid'
import { publicProcedure, router } from '~/server/trpc'
import { set } from 'lodash'
import { getUserInfo, type SgidUserInfo } from './sgid.utils'
import { defaultUserSelect } from '../../user/user.select'

const sgidCallbackStateSchema = z
  .custom<string>((data) => {
    try {
      JSON.parse(String(data))
    } catch (error) {
      return false
    }
    return true
  }, 'invalid json') // write whatever error you want here
  .transform((content) => JSON.parse(content))
  .pipe(
    z.object({
      landingUrl: z.string(),
    })
  )

export const sgidRouter = router({
  login: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/auth/sgid',
      },
    })
    .input(
      z.object({
        landingUrl: z.string().default('/home'),
      })
    )
    .output(z.unknown())
    .query(async ({ ctx, input: { landingUrl } }) => {
      if (!ctx.res || !ctx.req) {
        throw new TRPCError({
          code: 'UNPROCESSABLE_CONTENT',
          message: 'Missing response or request object in context',
        })
      }
      // Already logged in.
      if (ctx.session?.user) {
        return ctx.res.redirect(landingUrl)
      }

      const { codeChallenge, codeVerifier } = generatePkcePair()
      const options: AuthorizationUrlParams = {
        codeChallenge,
        state: JSON.stringify({ landingUrl }),
        redirectUri: env.SGID_REDIRECT_URI,
      }
      const { url, nonce } = sgid.authorizationUrl(options)

      // Store the code verifier and nonce in the session to retrieve in the callback.
      set(ctx, 'session.sgidSessionState', {
        codeVerifier,
        nonce,
      })
      await ctx.session?.save()

      return ctx.res?.redirect(url)
    }),
  callback: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/auth/sgid/callback',
      },
    })
    .input(
      z.object({
        state: z.string(),
        code: z.string(),
      })
    )
    .output(z.unknown())
    .query(async ({ ctx, input: { state, code } }) => {
      if (!ctx.res || !ctx.session?.sgidSessionState) {
        throw new TRPCError({
          code: 'UNPROCESSABLE_CONTENT',
          message: 'Invalid context',
        })
      }
      const parsedState = sgidCallbackStateSchema.safeParse(state)
      if (!parsedState.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid state',
        })
      }

      const { codeVerifier, nonce } = ctx.session.sgidSessionState
      // let sgidSub: string
      let sgidUserInfo: SgidUserInfo

      try {
        const userInfo = await getUserInfo({ code, codeVerifier, nonce })
        // sgidSub = userInfo.sub
        sgidUserInfo = userInfo
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            (error as Error).message ||
            'Something went wrong whilst fetching SGID user info',
        })
      }

      // Upsert user
      // TODO: Link user to account instead
      const user = await ctx.prisma.user.create({
        data: {
          name: sgidUserInfo.data['myinfo.name'],
        },
        select: defaultUserSelect,
      })

      ctx.session.destroy()
      ctx.session.user = user
      await ctx.session.save()
    }),
})
