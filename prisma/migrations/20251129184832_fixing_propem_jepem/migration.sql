/*
  Warnings:

  - You are about to drop the column `c_blokir` on the `produkpembiayaan` table. All the data in the column will be lost.
  - You are about to drop the column `c_mutasi` on the `produkpembiayaan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `jenispembiayaan` ADD COLUMN `c_mutasi` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `produkpembiayaan` DROP COLUMN `c_blokir`,
    DROP COLUMN `c_mutasi`;
