# Example Feature: allowing replies on posts

> This feature is already in the application, but here as documentation on how one could approach the problem.

There are usually 3 main parts to adding a feature:

- Making schema changes to the database (if needed)
- Adding backend code
- Adding frontend code

This document will describe the flow of adding such a feature to the application.

## Making schema changes to the database

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

The changes to add to form a tree-like structure could be as follows:

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

You should then run `npm run migrate` to perform the migration to reify the changes to the database.

#### Related documentation

- [Prisma data model](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model)
- [Prisma schema file](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [Prisma relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
