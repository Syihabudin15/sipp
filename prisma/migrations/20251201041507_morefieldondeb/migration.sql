/*
  Warnings:

  - You are about to drop the column `keluarga` on the `debitur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `debitur` DROP COLUMN `keluarga`,
    ADD COLUMN `agama` VARCHAR(191) NULL,
    ADD COLUMN `alm_pekerjaan` VARCHAR(191) NULL,
    ADD COLUMN `d_alm_peserta` VARCHAR(191) NULL,
    ADD COLUMN `d_kecamatan` VARCHAR(191) NULL,
    ADD COLUMN `d_kelurahan` VARCHAR(191) NULL,
    ADD COLUMN `d_kota` VARCHAR(191) NULL,
    ADD COLUMN `d_provinsi` VARCHAR(191) NULL,
    ADD COLUMN `geo_location` VARCHAR(191) NULL,
    ADD COLUMN `ibu_kandung` VARCHAR(191) NULL,
    ADD COLUMN `jenis_kelamin` VARCHAR(191) NULL,
    ADD COLUMN `jenis_usaha` VARCHAR(191) NULL,
    ADD COLUMN `kelompok_pensiun` VARCHAR(191) NULL,
    ADD COLUMN `kelurahan` VARCHAR(191) NULL,
    ADD COLUMN `menempati_rumah` VARCHAR(191) NULL,
    ADD COLUMN `nama_skep` VARCHAR(191) NULL,
    ADD COLUMN `nik` VARCHAR(191) NULL,
    ADD COLUMN `pekerjaan` VARCHAR(191) NULL,
    ADD COLUMN `pendidikan` VARCHAR(191) NULL,
    ADD COLUMN `provinsi` VARCHAR(191) NULL,
    ADD COLUMN `status_kawin` VARCHAR(191) NULL,
    ADD COLUMN `status_rumah` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Keluarga` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nik` VARCHAR(191) NULL,
    `tgl_lahir` DATETIME(3) NULL,
    `hubungan` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NULL,
    `no_telepon` VARCHAR(191) NULL,
    `pekerjaan` VARCHAR(191) NULL,
    `nopen` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Keluarga` ADD CONSTRAINT `Keluarga_nopen_fkey` FOREIGN KEY (`nopen`) REFERENCES `Debitur`(`nopen`) ON DELETE RESTRICT ON UPDATE CASCADE;
