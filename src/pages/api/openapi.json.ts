import { type NextApiRequest, type NextApiResponse } from 'next'

import { openApiDocument } from '../../server/openapi'

// Respond with our OpenAPI schema
const handler = (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json(openApiDocument)
}

export default handler
