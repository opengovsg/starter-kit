/**
 * Integration test example for the `post` router
 */
import { createContextInner } from '../context';
import { appRouter } from './_app';

test('fetch posts', async () => {
  const ctx = await createContextInner({});
  const caller = appRouter.createCaller(ctx);

  const posts = await caller.post.list({}); // should be empty

  expect(posts.items).not.toBeNull();
});
