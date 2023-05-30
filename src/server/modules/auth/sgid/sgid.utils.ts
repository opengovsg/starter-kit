import { z } from 'zod'
import { sgid } from '~/lib/sgid'

const expectedUserInfo = z.object({
  sub: z.string(),
  data: z.object({
    'myinfo.name': z.string(),
    email: z.string().email().optional(),
  }),
})
export type SgidUserInfo = z.infer<typeof expectedUserInfo>

export const getUserInfo = async ({
  code,
  codeVerifier,
  nonce,
}: {
  code: string
  codeVerifier: string
  nonce?: string
}) => {
  const { sub, accessToken } = await sgid.callback({
    code,
    nonce,
    codeVerifier,
  })
  const userinfo = await sgid.userinfo({ sub, accessToken })
  return expectedUserInfo.parse(userinfo)
}
