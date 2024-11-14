import { type NextApiRequest, type NextApiResponse } from 'next'
import cors from 'nextjs-cors'
import { createOpenApiNextHandler } from 'trpc-swagger'

import { createContext } from '~/server/context'
import { appRouter } from '~/server/modules/_app'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Setup CORS
  await cors(req, res)

  // Handle incoming OpenAPI requests
  return createOpenApiNextHandler({
    router: appRouter,
    createContext,
    responseMeta: undefined,
    onError: undefined,
  })(req, res)
}

export default handler
