import { generateOpenApiDocument } from 'trpc-swagger'

import { getBaseUrl } from '~/utils/getBaseUrl'
import { appRouter } from './modules/_app'

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'tRPC Swagger',
  version: '1.0.0', // consider making this pull version from package.json
  baseUrl: `${getBaseUrl()}/api`,
})
