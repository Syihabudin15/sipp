/*
  Warnings:

  - You are about to drop the column `ao1Id` on the `dapem` table. All the data in the column will be lost.
  - You are about to drop the column `ao2Id` on the `dapem` table. All the data in the column will be lost.
  - Added the required column `aoId` to the `Dapem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `dapem` DROP FOREIGN KEY `Dapem_ao1Id_fkey`;

-- DropForeignKey
ALTER TABLE `dapem` DROP FOREIGN KEY `Dapem_ao2Id_fkey`;

-- DropIndex
DROP INDEX `Dapem_ao1Id_fkey` ON `dapem`;

-- DropIndex
DROP INDEX `Dapem_ao2Id_fkey` ON `dapem`;

-- AlterTable
ALTER TABLE `dapem` DROP COLUMN `ao1Id`,
    DROP COLUMN `ao2Id`,
    ADD COLUMN `aoId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Dapem` ADD CONSTRAINT `Dapem_aoId_fkey` FOREIGN KEY (`aoId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
