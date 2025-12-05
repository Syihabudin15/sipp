/*
  Warnings:

  - You are about to alter the column `status_final` on the `pelunasan` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(11))`.

*/
-- AlterTable
ALTER TABLE `pelunasan` MODIFY `status_final` ENUM('DRAFT', 'ANTRI', 'PROSES', 'TRANSFER', 'LUNAS', 'GAGAL') NOT NULL DEFAULT 'ANTRI';
