import { generateOpenApiDocument } from 'trpc-openapi'
import { appRouter } from './modules/_app'
import { getBaseUrl } from '~/utils/getBaseUrl'

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Starter Kit OpenAPI',
  version: '1.0.0',
  baseUrl: `${getBaseUrl()}/api`,
})
