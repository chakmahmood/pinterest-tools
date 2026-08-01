/*
  Warnings:

  - You are about to drop the column `annotationKeyword` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "annotationKeyword",
ADD COLUMN     "annotationKeywords" TEXT[];
