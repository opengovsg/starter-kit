import { router } from '~/server/trpc';
import { emailSessionRouter } from './email';

export const sessionRouter = router({
  email: emailSessionRouter,
});
