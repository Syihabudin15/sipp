/*
  Warnings:

  - You are about to drop the column `debiturId` on the `dapem` table. All the data in the column will be lost.
  - The primary key for the `debitur` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `debitur` table. All the data in the column will be lost.
  - Added the required column `nopen` to the `Dapem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `dapem` DROP FOREIGN KEY `Dapem_debiturId_fkey`;

-- DropIndex
DROP INDEX `Dapem_debiturId_fkey` ON `dapem`;

-- AlterTable
ALTER TABLE `dapem` DROP COLUMN `debiturId`,
    ADD COLUMN `nopen` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `debitur` DROP PRIMARY KEY,
    DROP COLUMN `id`;

-- AddForeignKey
ALTER TABLE `Dapem` ADD CONSTRAINT `Dapem_nopen_fkey` FOREIGN KEY (`nopen`) REFERENCES `Debitur`(`nopen`) ON DELETE RESTRICT ON UPDATE CASCADE;
