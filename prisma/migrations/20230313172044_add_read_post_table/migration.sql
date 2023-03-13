-- CreateTable
CREATE TABLE "ReadPosts" (
    "post_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadPosts_pkey" PRIMARY KEY ("post_id","user_id")
);

-- CreateIndex
CREATE INDEX "ReadPosts_post_id_idx" ON "ReadPosts"("post_id");

-- CreateIndex
CREATE INDEX "ReadPosts_user_id_idx" ON "ReadPosts"("user_id");

-- AddForeignKey
ALTER TABLE "ReadPosts" ADD CONSTRAINT "ReadPosts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ReadPosts" ADD CONSTRAINT "ReadPosts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
