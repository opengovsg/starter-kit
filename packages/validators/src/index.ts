import { z } from 'zod/v4'

export const unused = z.string().describe(
  `This lib is currently not used.
  But as your application grows and you need other validators to share with back and frontend,
  you can put them in here
  `,
)
