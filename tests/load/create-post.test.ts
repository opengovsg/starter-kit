import { check } from 'k6'
import { createClient, createOptions } from 'k6-trpc'
import { type Options } from 'k6/options'
import superjson from 'superjson'

import { type AppRouter } from '~/server/modules/_app'

const PARAMETERS = {
  SESSION_COOKIE: __ENV.SESSION_COOKIE,
  BASE_URL: __ENV.BASE_URL ?? 'http://localhost:3000',
} as const

const apiOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
} as const

const client = createClient<AppRouter>(
  `${PARAMETERS.BASE_URL}/api/trpc/`,
  superjson
)

export const options: Options = {
  vus: 100,
  duration: '60s',
} as const

export const setup = () => {
  if (!PARAMETERS.SESSION_COOKIE) {
    throw new Error('No session cookie provided.')
  }

  // For some reason, k6 will capitalize the first letter of object keys
  return { session: PARAMETERS.SESSION_COOKIE }
}

export default function test({ session }: ReturnType<typeof setup>) {
  const response = client.post.add.mutate(
    {
      content: `Hello World!

This is a new post!`,
      contentHtml:
        '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"Hello World!"}]},{"type":"paragraph"},{"type":"paragraph","content":[{"type":"text","text":"This is a new post!"}]}]}',
    },
    createOptions({
      ...apiOptions,
      cookies: { 'auth.session-token': session },
    })
  )

  check(response, {
    'Create post mutation is successful': () => response.status < 300,
  })
}
