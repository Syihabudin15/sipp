/*
  Warnings:

  - Added the required column `pembulatan` to the `Dapem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `dapem` ADD COLUMN `pembulatan` INTEGER NOT NULL;
