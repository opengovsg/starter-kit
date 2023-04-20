/*
  Warnings:

  - You are about to drop the column `anonymous` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `hidden` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_author_id_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_post_id_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "anonymous";
ALTER TABLE "Post" DROP COLUMN "deletedAt";
ALTER TABLE "Post" DROP COLUMN "hidden";
ALTER TABLE "Post" DROP COLUMN "published";
ALTER TABLE "Post" ADD COLUMN     "deleted_at" TIMESTAMP;
ALTER TABLE "Post" ADD COLUMN     "parent_post_id" STRING;

-- DropTable
DROP TABLE "Comment";

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_parent_post_id_fkey" FOREIGN KEY ("parent_post_id") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
