import {
  TRPC_ERROR_CODES_BY_KEY,
  type TRPC_ERROR_CODE_KEY,
} from '@trpc/server/rpc'
import { z } from 'zod'

const TRPC_ERROR_CODE_KEY_ENUM = Object.keys(
  TRPC_ERROR_CODES_BY_KEY
) as unknown as [TRPC_ERROR_CODE_KEY, ...TRPC_ERROR_CODE_KEY[]]

export const TRPCWithErrorCodeSchema = z
  .object({
    data: z.object({ code: z.enum(TRPC_ERROR_CODE_KEY_ENUM) }),
  })
  .transform((data) => data.data.code)
