/*
  Warnings:

  - Added the required column `sisa` to the `Angsuran` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `angsuran` ADD COLUMN `sisa` INTEGER NOT NULL;
