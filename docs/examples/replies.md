# Example Feature: allowing replies on posts

> 🗒️ This feature is already in the application, but here as documentation on how one could approach the problem.

TODO: Add link to app folder structure

> Refresher: [App folder structure](../docs/folder-structure.md)

There are usually 3 main parts to adding a feature:

- Making schema changes to the database (if needed)
- Updating application tRPC routers ("backend" code)
- Using new data in the application ("frontend" code)

This document will describe the flow of adding such a feature to the application.

## Making schema changes to the database

We use Prisma as the database ORM for the application layer, and CockroachDB for the database layer.

#### Related documentation

- [Prisma data model](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model)
- [Prisma schema file](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [Prisma relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)

### Updating schema

To allow for replies on posts, we need make some changes to the database schema.
For this application, we have decided to make replies have the same connotation as posts, i.e all replies are also `Post`, and have a `parentPostId` field to indicate that they are a reply to a post. This could be recursive, and as such each Post could have a `replies` field that is a list of references to `Post` ids, forming a tree structure.

> 🗒️ Note that this may not be the best way to model replies, but it is a simple way to demonstrate the process of adding a feature.

#### Original schema

Assuming the original schema is as follows:

```prisma
model Post {
  id          String       @id @default(cuid())
  title       String?      @db.Text
  content     String       @db.Text
  contentHtml String       @map("content_html") @db.Text
  author      User         @relation(fields: [authorId], references: [id], onDelete: Cascade)
  likes       LikedPosts[]
  readBy      ReadPosts[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @default(now()) @updatedAt @map("updated_at")

  deletedAt DateTime? @map("deleted_at") @db.Timestamp

  authorId String @map("author_id")

  @@index([authorId])
}
```

#### New schema

The changes to add could be as follows:

```prisma
model Post {
  // 🗒️ Previous fields still exist, just hidden for brevity

  // This features the self-relation Prisma concept, specifically a one-to-many self relation.
  // https://www.prisma.io/docs/concepts/components/prisma-schema/relations/self-relations
  parentPostId String? @map("parent_post_id")
  // The parent post of this post, if it is a reply.
  // @relation("PostToParent") is the name of the relation.
  parent       Post?   @relation("PostReplies", fields: [parentPostId], references: [id])
  // The replies to this post. The reverse side of the relation.
  replies      Post[]  @relation("PostReplies")
}
```

The above relation changes expresses the following:

- "a post has zero or one parent post"
- "a post has zero or more replies"

### Performing database migration

You should then run

```
npm run migrate:dev
```

to perform the migration to reify the changes to the database.

This will create a new migration file in `prisma/migrations` that will be applied to the database when the application is deployed (from `npm run prebuild` script).

---

## Updating application tRPC code

We use tRPC for the application layer, and tRPC routers for the backend code.

> TODO: Add documentation for folder structure

See our [folder structure documentation](../docs/folder-structure.md) for more information on how the application is structured, and where tRPC routers are recommended to be located.

#### Related documentation

- [tRPC quickstart](https://trpc.io/docs/quickstart) (helps to familiarise with terms like `procedure`, `query`, `router`, etc that will be used throughout the next section)
- [tRPC context](https://trpc.io/docs/context) (helps to familiarise with the concept of context, which holds data that all tRPC procedures will have access to)

### Adding new tRPC procedures

With the commenting feature (and other features), we usually need to add CRUD (create, read, update, delete) related code to the application. The following sections will describe how to add such code.

There is already routers set up in the application, but replying to posts is a new feature and should be subject to its own router, and could make it it easier to reason about the code if it is separated.
For other routing examples, look at each `*.router.ts` file in [`src/server/modules/*`](../../src/server/modules).

#### Creating a new `thread` subrouter

For this feature, we will create a new router in `src/server/modules/thread/thread.router.ts`, since the feature as a whole seems to be about threads, and not just replies.

```ts
export const threadRouter = router({
  // Add queries and mutations here.
});
```

#### Adding `reply` functionality

Replying to a post is a mutation, and as such we will add a `reply` procedure to the `threadRouter`.

```ts
export const threadRouter = router({
  reply: protectedProcedure // 🗒️ Exposed in src/server/trpc.ts to only allow authenticated users.
    .input(...)
    .mutation(...)
})
```

tRPC uses `zod` under the hood, and you can provide a schema to control what is allowed in the mutation's `input`.

```ts
import { z } from 'zod'

export const threadRouter = router({
  reply: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        contentHtml: z.string().min(1),
        postId: z.string(),
      })
    )
    .mutation(...)
})
```

The mutation should then create a new reply `Post` in the database:

```ts
export const threadRouter = router({
  reply: protectedProcedure.input(addReplySchema).mutation(
    async ({
      // Contains the validated input according to the shape declared in `.input`.
      input,
      // Contains the context, which is the `trpc` context declared in `src/server/context.ts`.
      ctx,
    }) => {
      const { postId, ...replyData } = input;
      return await ctx.prisma.$transaction(async (tx) => {
        const parent = await tx.post.findFirst({
          where: {
            id: postId,
            deletedAt: null,
          },
        });
        if (!parent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Post '${postId}' does not exist`,
          });
        }
        return await ctx.prisma.post.create({
          data: {
            ...replyData,
            author: {
              connect: {
                id: ctx.session.user.id,
              },
            },
            parent: {
              connect: {
                id: postId,
              },
            },
          },
          // It is a best practice to be explicit about what fields are returned, to avoid
          // accidentally leaking sensitive data (especially if fields are added to the model).
          select: defaultReplySelect,
        });
      });
    },
  ),
});
```

#### Adding this new nested router to the application router

This new router should be added to the application router, which is located in `src/server/modules/_app.ts`.

```ts
export const appRouter = router({
  ...
  thread: threadRouter,
})
```

At this point, the new mutation will be available to the application.

---
