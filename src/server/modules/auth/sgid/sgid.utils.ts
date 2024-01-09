import { z } from 'zod'
import { sgid } from '~/lib/sgid'
import { safeSchemaJsonParse } from '~/utils/zod'

const pocdexSgidSchema = z.array(
  z.object({
    work_email: z.string().email().optional(),
    agency_name: z.string().optional(),
    department_name: z.string().optional(),
    employment_type: z.string().optional(),
    employment_title: z.string().optional(),
  }),
)

const expectedUserInfo = z.object({
  sub: z.string(),
  data: z.object({
    'myinfo.name': z.string(),
    'pocdex.public_officer_details': z.string().transform((value, ctx) => {
      const result = safeSchemaJsonParse(pocdexSgidSchema, value)
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.error.message,
        })
        return z.NEVER
      }
      return result.data
    }),
  }),
})
export type SgidUserInfo = z.infer<typeof expectedUserInfo>

export const sgidSessionProfileSchema = z.object({
  list: pocdexSgidSchema,
  name: expectedUserInfo.shape.data.shape['myinfo.name'],
  sub: expectedUserInfo.shape.sub,
  expiry: z.number(),
})
export type SgidSessionProfile = z.infer<typeof sgidSessionProfileSchema>

export const getUserInfo = async ({
  code,
  codeVerifier,
  nonce,
}: {
  code: string
  codeVerifier: string
  nonce?: string
}) => {
  if (!sgid) {
    throw new Error('SGID is not enabled')
  }

  const { sub, accessToken } = await sgid.callback({
    code,
    nonce,
    codeVerifier,
  })
  const userinfo = await sgid.userinfo({ sub, accessToken })
  return expectedUserInfo.parse(userinfo)
}
