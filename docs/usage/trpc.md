# tRPC

tRPC allows us to write end-to-end typesafe APIs without any code generation or runtime bloat. It uses TypeScript's great inference to infer your API router's type definitions and lets you call your API procedures from your frontend with full typesafety and autocompletion. When using tRPC, your frontend and backend feel closer together than ever before, allowing for an outstanding developer experience.

## How do I use tRPC?

With tRPC, you write TypeScript functions on your backend, and then call them from your frontend. A simple tRPC procedure could look like this:

```ts
// server/modules/post/post.router.ts
const postRouter = router({
  byId: protectedProcedure
    .input(z.string())
    .query(({ ctx, input }) => {
      return ctx.prisma.post.findFirst({
        where: {
          id: input,
          select:
        },
      });
    }),
});
```

This is a tRPC procedure (equivalent to a route handler in a traditional backend) that first validates the input using [Zod](https://zod.dev/) - in this case, it's making sure that the input is a string. If the input is not a string it will send an informative error instead.

After the input, we chain a resolver function which can be either a [query](https://trpc.io/docs/reactjs/usequery), [mutation](https://trpc.io/docs/reactjs/usemutation), or a [subscription](https://trpc.io/docs/subscriptions). In our example, the resolver calls our database using our [prisma](./prisma.md) client and returns the user whose `id` matches the one we passed in.

You define your procedures in `<feature>.router.ts` which represent a collection of related procedures with a shared namespace. You may have one router for `auth`, one for `posts`, and additional subrouters for other features. These routers can then be merged into a single, centralized `appRouter`:

```ts
// src/server/modules/_app.ts
export const appRouter = router({
  auth: authRouter,
  post: postRouter,
  thread: threadRouter,
});

export type AppRouter = typeof appRouter;
```

Now let's call the procedure on our frontend. tRPC provides a wrapper for `@tanstack/react-query` which lets you utilize the full power of the hooks they provide, but with the added benefit of having your API calls typed and inferred. We can call our procedures from our frontend like this:

```tsx
// src/pages/feedback/[id].tsx
import { useRouter } from 'next/router';
import { trpc } from '~/utils/trpc';

const PostViewPage = () => {
  const { query } = useRouter();
  const { data } = trpc.post.byId.useQuery(query.id);

  return (
    <div>
      <h1>
        {data.replies.map((reply) => (
          <span>{reply.content}</span>
        ))}
      </h1>
    </div>
  );
};
```

You'll immediately notice how good the autocompletion and typesafety is. As soon as you write `trpc.`, your routers will show up in autocomplete, and when you select a router, its procedures will show up as well. You'll also get a TypeScript error if your input doesn't match the validator that you defined on the backend.

## Inferring errors

### On the client

If you share the zod schema between the frontend and backend by using the schema inside `react-hook-form`, input errors can be inferred and displayed on the frontend before backend checks.

Example usage:

```tsx
// react-hook-form zod schema example
import { useZodForm } from '~/lib/form';
import { addPostSchema } from '~/schemas/post';

function MyComponent() {
  const mutation = trpc.post.add.useMutation({
    async onSuccess({ id }) {
      // refetches posts after a post is added
      await utils.post.list.invalidate();
      router.push(`${FEEDBACK}/${id}`);
    },
    onError: (error) => {
      toast({ description: error.message });
    },
  });

  // The app has a `useZodForm` hook that you can use with zod schemas for type inference with `react-hook-form`.
  const {
    formState: { errors },
    handleSubmit,
    setValue,
    control,
    reset,
  } = useZodForm({
    schema: addPostSchema,
  });

  return (
    <form onSubmit={handleSubmit((input) => mutation.mutate(input))}>
      <FormControl
        id="title"
        isInvalid={!!errors.title}
        isReadOnly={mutation.isLoading}
      >
        <FormLabel htmlFor="title">Post title</FormLabel>
        <Input {...register('title')} />
        {/** zod schema returned with an error on `title` */}
        <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
      </FormControl>
      {/* ... */}
    </form>
  );
}
```

### On the server

The tRPC [error formatter](https://trpc.io/docs/error-formatting) has been set up in `src/server/trpc.ts` that lets you infer your Zod Errors if you get validation errors on the backend.

Catching such errors could be optional if the zod schemas are already shared on the client and the client is already validating the input.

Example usage:

```ts
// Example of not using react-hook-form (but not recommended)
function MyComponent() {
  const mutation = trpc.post.add.useMutation({
    async onSuccess({ id }) {
      // refetches posts after a post is added
      await utils.post.list.invalidate();
      router.push(`${FEEDBACK}/${id}`);
    },
    onError: (error) => {
      toast({ description: error.message });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        mutation.mutate({ title: formData.get('title') });
      }}
    >
      <FormControl
        id="title"
        isInvalid={!!error.data.zodError.fieldErrors.title}
        isReadOnly={mutation.isLoading}
      >
        <Input name="title" />
        <FormErrorMessage>
          {error.data.zodError.fieldErrors.title}
        </FormErrorMessage>
      </FormControl>
      {/* ... */}
    </form>
  );
}
```

## Files

tRPC requires quite a lot of boilerplate that `ogp-starter-kit` sets up for you. Let's go over the files that are generated:

### 📄 `src/pages/api/trpc/[trpc].ts`

This is the entry point for your API and exposes the tRPC router. Normally, you won't touch this file very much, but if you need to, for example, enable CORS middleware or similar, it's useful to know that the exported `createNextApiHandler` is a [Next.js API handler](https://nextjs.org/docs/api-routes/introduction) which takes a [request](https://developer.mozilla.org/en-US/docs/Web/API/Request) and [response](https://developer.mozilla.org/en-US/docs/Web/API/Response) object. This means that you can wrap the `createNextApiHandler` in any middleware you want. See below for an [example snippet](#enabling-cors) of adding CORS.

### 📄 `src/server/trpc.ts`

This file handles tRPC initialization:

We initialize tRPC and define reusable [procedures](https://trpc.io/docs/server/procedures) and [middlewares](https://trpc.io/docs/server/middlewares). By convention, you shouldn't export the entire `t`-object but instead, create reusable procedures and middlewares and export those.

You'll notice we use `superjson` as [data transformer](https://trpc.io/docs/server/data-transformers). This makes it so that your data types are preserved when they reach the client, so if you for example send a `Date` object, the client will return a `Date` and not a string which is the case for most APIs.

### 📄 `src/server/context.ts`

This file defines the context that is passed to your tRPC procedures. Context is data that all of your tRPC procedures will have access to, and is a great place to put things like database connections, authentication information, etc. In `ogp-starter-kit` we use two functions, to enable using a subset of the context when we do not have access to the request object.

- `createContextInner`: This is where you define context which doesn't depend on the request, e.g. your database connection (in our case, via `prisma`). You can use this function for [integration testing](#sample-integration-test) or [ssg-helpers](https://trpc.io/docs/v10/ssg-helpers) where you don't have a request object.
- `createContext`: This is where you define context which depends on the request, e.g. the user's session. You request the session using the `opts.req` object, and then pass the session down to the `createContextInner` function to create the final context.

### 📄 `src/server/modules/<module>/<module>.router.ts`

This is where you define the routes and procedures of your API. By convention, you [create separate routers](https://trpc.io/docs/server/routers) for related procedures.

### 📄 `src/server/modules/_app.ts`

Here we [merge](https://trpc.io/docs/v10/merging-routers) all the sub-routers defined in `*.router.ts` into a single app router.

### 📄 `src/utils/trpc.ts`

This is the frontend entry point for tRPC. This is where you'll import the router's **type definition** and create your tRPC client along with the react-query hooks. Since we enabled `superjson` as our data transformer on the backend, we need to enable it on the frontend as well. This is because the serialized data from the backend is deserialized on the frontend.

You'll define your tRPC [links](https://trpc.io/docs/v10/links) here, which determines the request flow from the client to the server. We use the "default" [`httpBatchLink`](https://trpc.io/docs/v10/links/httpBatchLink) which enables [request batching](https://cloud.google.com/compute/docs/api/how-tos/batch), as well as a [`loggerLink`](https://trpc.io/docs/v10/links/loggerLink) which outputs useful request logs during development.

Lastly, we export [helper types](https://trpc.io/docs/v10/infer-types#additional-dx-helper-type) `RouterInput` and `RouterOutput`, which you can use to infer your types on the frontend.

## How do I call my API externally?

With regular APIs, you can call your endpoints using any HTTP client such as `curl`, `Postman`, `fetch` or straight from your browser. With tRPC, it's a bit different. If you want to call your procedures without the tRPC client, there are two recommended ways to do it:

### Expose a single procedure externally

If you want to expose a single procedure externally, you're looking for [server side calls](https://trpc.io/docs/v10/server-side-calls). That would allow you to create a normal Next.js API endpoint, but reuse the resolver part of your tRPC procedure.

```ts
// src/pages/api/posts/[id].ts
import { type NextApiRequest, type NextApiResponse } from 'next';
import { type TRPCError } from '@trpc/server';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';

import { appRouter } from '~/server/modules/_app';
import { createContext } from '~/server/context';

const postByIdHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Create context and caller
  const ctx = await createContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  try {
    const { id } = req.query;
    const user = await caller.post.byId({ id: String(id) });
    res.status(200).json(user);
  } catch (cause) {
    if (cause instanceof TRPCError) {
      // An error from tRPC occured
      const httpCode = getHTTPStatusCodeFromError(cause);
      return res.status(httpCode).json(cause);
    }
    // Another error occured
    console.error(cause);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default postByIdHandler;
```

### Exposing every procedure as a REST endpoint

If you want to expose every single procedure externally, checkout the community built plugin [trpc-openapi](https://github.com/jlalmes/trpc-openapi/tree/master). By providing some extra meta-data to your procedures, you can generate an OpenAPI compliant REST API from your tRPC router.

### It's just HTTP Requests

tRPC communicates over HTTP, so it is also possible to call your tRPC procedures using "regular" HTTP requests. However, the syntax can be cumbersome due to the [RPC protocol](https://trpc.io/docs/v10/rpc) that tRPC uses. If you're curious, you can check what tRPC requests and responses look like in your browser's network tab, but we suggest doing this only as an educational exercise and sticking to one of the solutions outlined above.

## Comparison to a Next.js API endpoint

Let's compare a Next.js API endpoint to a tRPC procedure. Let's say we want to fetch a post object from our database and return it to the frontend. We could write a Next.js API endpoint like this:

```ts
// src/pages/api/posts/[id].ts
import { type NextApiRequest, type NextApiResponse } from 'next';
import { prisma } from '~/server/prisma';

const postByIdHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const post = await prisma.post.findFirst({
    where: {
      id,
    },
  });

  res.status(200).json(post);
};

export default postByIdHandler;
```

```ts
// src/pages/posts/[id].ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const PostPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [post, setPost] = useState(null);
  useEffect(() => {
    fetch(`/api/post/${id}`)
      .then((res) => res.json())
      .then((data) => setPost(data));
  }, [id]);
};
```

Compare this to the tRPC example above and you can see some of the advantages of tRPC:

- Instead of specifying a url for each route, which can become annoying to debug if you move something, your entire router is an object with autocomplete.
- You don’t need to validate which HTTP method was used.
- You don’t need to validate that the request query or body contains the correct data in the procedure, because Zod takes care of this.
- Instead of creating a response, you can throw errors and return a value or object as you would in any other TypeScript function.
- Calling the procedure on the frontend provides autocompletion and type safety.

## Useful snippets

Here are some snippets that might come in handy.

### Enabling CORS

If you need to consume your API from a different domain, for example in a monorepo that includes a React Native app, you might need to enable CORS:

```ts
// src/pages/api/trpc/[trpc].ts
import { type NextApiRequest, type NextApiResponse } from 'next';
import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '~/server/modules/_app';
import { createContext } from '~/server/context';
import cors from 'nextjs-cors';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Enable cors
  await cors(req, res);

  // Create and call the tRPC handler
  return createNextApiHandler({
    router: appRouter,
    createContext,
  })(req, res);
};

export default handler;
```

### Optimistic updates

Optimistic updates are when we update the UI before the API call has finished. This gives the user a better experience because they don't have to wait for the API call to finish before the UI reflects the result of their action. However, apps that value data correctness highly should avoid optimistic updates as they are not a "true" representation of backend state. You can read more on the [React Query docs](https://tanstack.com/query/v4/docs/guides/optimistic-updates).

```tsx
const MyComponent = () => {
  const listPostQuery = trpc.post.list.useQuery();

  const utils = trpc.useContext();
  const postCreate = trpc.post.create.useMutation({
    async onMutate(newPost) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utils.post.list.cancel();

      // Get the data from the queryCache
      const prevData = utils.post.list.getData();

      // Optimistically update the data with our new post
      utils.post.list.setData(undefined, (old) => [...old, newPost]);

      // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    onError(err, newPost, ctx) {
      // If the mutation fails, use the context-value from onMutate
      utils.post.list.setData(undefined, ctx.prevData);
    },
    onSettled() {
      // Sync with server once mutation has settled
      utils.post.list.invalidate();
    },
  });
};
```

### Sample Integration Test

Here is a sample integration test that uses [Vitest](https://vitest.dev) to check that your tRPC router is working as expected, the input parser infers the correct type, and that the returned data matches the expected output.

```ts
import { type inferProcedureInput } from '@trpc/server';
import { appRouter, type AppRouter } from '~/server/modules/_app';
import { createContextInner } from '~/server/context';

import { expect, test } from 'vitest';

test('example router', async () => {
  const ctx = await createContextInner({ session: null });
  const caller = appRouter.createCaller(ctx);

  type Input = inferProcedureInput<AppRouter['example']['hello']>;
  const input: Input = {
    text: 'test',
  };

  const example = await caller.example.hello(input);

  expect(example).toMatchObject({ greeting: 'Hello test' });
});
```

If your procedure is protected, you can pass in a mocked `session` object when you create the context:

```ts
test('protected example router', async () => {
  const ctx = await createContextInner({
    session: {
      user: { id: '123', name: 'John Doe' },
      expires: '1',
    },
  });
  const caller = appRouter.createCaller(ctx);

  // ...
});
```

## Useful Resources

| Resource               | Link                                                    |
| ---------------------- | ------------------------------------------------------- |
| tRPC Docs              | https://www.trpc.io                                     |
| Bunch of tRPC Examples | https://github.com/trpc/trpc/tree/next/examples         |
| React Query Docs       | https://tanstack.com/query/v4/docs/adapters/react-query |
