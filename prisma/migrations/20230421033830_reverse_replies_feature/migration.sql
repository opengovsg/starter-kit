/*
  Warnings:

  - You are about to drop the column `parent_post_id` on the `Post` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_parent_post_id_fkey";

-- DropIndex
DROP INDEX "Post_parent_post_id_deleted_at_id_idx";

-- DropIndex
DROP INDEX "Post_parent_post_id_idx";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "parent_post_id";
