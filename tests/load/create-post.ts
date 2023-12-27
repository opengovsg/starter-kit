import { check } from 'k6'
import { createClient, createOptions } from 'k6-trpc'
import { type Options } from 'k6/options'
import superjson from 'superjson'

import { type AppRouter } from '~/server/modules/_app'

const PARAMETERS = {
  SESSION_COOKIE: __ENV.SESSION_COOKIE,
  BASE_URL: __ENV.BASE_URL,
}

const apiOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
}

const client = createClient<AppRouter>(
  `${PARAMETERS.BASE_URL}/api/trpc/`,
  superjson
)

export const options: Options = {
  vus: 1000,
  duration: '60s',
}

export default function test() {
  const response = client.post.add.mutate(
    {
      title: 'Hello World!',
      content: `Hello World!

This is a new post!`,
      contentHtml:
        '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"Hello World!"}]},{"type":"paragraph"},{"type":"paragraph","content":[{"type":"text","text":"This is a new post!"}]}]}',
    },
    createOptions({
      ...apiOptions,
      cookies: { 'auth.session-token': PARAMETERS.SESSION_COOKIE ?? '' },
    })
  )

  check(response, {
    'Create post mutation is successful': () => response.status < 300,
  })
}
