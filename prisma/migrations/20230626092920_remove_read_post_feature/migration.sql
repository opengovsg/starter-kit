/*
  Warnings:

  - You are about to drop the `ReadPosts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReadPosts" DROP CONSTRAINT "ReadPosts_post_id_fkey";

-- DropForeignKey
ALTER TABLE "ReadPosts" DROP CONSTRAINT "ReadPosts_user_id_fkey";

-- DropTable
DROP TABLE "ReadPosts";
