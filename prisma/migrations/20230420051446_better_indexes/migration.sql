-- DropIndex
DROP INDEX "LikedPosts_post_id_idx";

-- DropIndex
DROP INDEX "LikedPosts_user_id_idx";

-- DropIndex
DROP INDEX "Post_author_id_idx";

-- DropIndex
DROP INDEX "ReadPosts_user_id_idx";

-- CreateIndex
CREATE INDEX "Post_parent_post_id_idx" ON "Post"("parent_post_id");

-- CreateIndex
CREATE INDEX "Post_parent_post_id_deleted_at_id_idx" ON "Post"("parent_post_id", "deleted_at", "id");

-- CreateIndex
CREATE INDEX "Post_deleted_at_idx" ON "Post"("deleted_at");

-- CreateIndex
CREATE INDEX "Post_created_at_idx" ON "Post"("created_at");
