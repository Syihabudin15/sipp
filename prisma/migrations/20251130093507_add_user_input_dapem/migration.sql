/*
  Warnings:

  - Added the required column `userId` to the `Dapem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `dapem` ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Dapem` ADD CONSTRAINT `Dapem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
