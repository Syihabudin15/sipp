/*
  Warnings:

  - You are about to drop the column `userId` on the `dapem` table. All the data in the column will be lost.
  - Added the required column `ao1Id` to the `Dapem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Dapem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `dapem` DROP FOREIGN KEY `Dapem_userId_fkey`;

-- DropIndex
DROP INDEX `Dapem_userId_fkey` ON `dapem`;

-- AlterTable
ALTER TABLE `dapem` DROP COLUMN `userId`,
    ADD COLUMN `ao1Id` VARCHAR(191) NOT NULL,
    ADD COLUMN `ao2Id` VARCHAR(191) NULL,
    ADD COLUMN `createdById` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Dapem` ADD CONSTRAINT `Dapem_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dapem` ADD CONSTRAINT `Dapem_ao1Id_fkey` FOREIGN KEY (`ao1Id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dapem` ADD CONSTRAINT `Dapem_ao2Id_fkey` FOREIGN KEY (`ao2Id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
