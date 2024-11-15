import { generateOpenApiDocument } from 'trpc-swagger'

import { getBaseUrl } from '~/utils/getBaseUrl'
import { appRouter } from './modules/_app'
import { sessionOptions } from './modules/auth/session'

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'tRPC Swagger',
  version: '1.0.0', // consider making this pull version from package.json
  baseUrl: `${getBaseUrl()}/api`,
  securitySchemes: {
    ironSession: {
      type: 'apiKey',
      in: 'cookie',
      name: sessionOptions.cookieName,
    },
  },
})
