/*
  Warnings:

  - You are about to drop the column `aiPrompt` on the `Post` table. All the data in the column will be lost.
  - Added the required column `imagePrompt` to the `Pin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pin" ADD COLUMN     "imagePrompt" TEXT NOT NULL,
ADD COLUMN     "keywords" TEXT[],
ADD COLUMN     "overlayText" TEXT,
ALTER COLUMN "imageUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "aiPrompt";
