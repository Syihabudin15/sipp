-- CreateTable
CREATE TABLE `Debitur` (
    `id` VARCHAR(191) NOT NULL,
    `nopen` VARCHAR(191) NOT NULL,
    `nama_pensiunan` VARCHAR(191) NOT NULL,
    `tgl_lahir_pensiunan` VARCHAR(191) NOT NULL,
    `gaji_pensiun` INTEGER NOT NULL,
    `nama_penerima` VARCHAR(191) NOT NULL,
    `tgl_lahir_penerima` VARCHAR(191) NOT NULL,
    `alm_peserta` VARCHAR(191) NOT NULL,
    `kecamatan` VARCHAR(191) NOT NULL,
    `kota` VARCHAR(191) NOT NULL,
    `kantor_bayar` VARCHAR(191) NOT NULL,
    `tmt_pensiun` DATETIME(3) NOT NULL,
    `no_skep` VARCHAR(191) NOT NULL,
    `tgl_skep` DATETIME(3) NOT NULL,
    `jenis_skep` VARCHAR(191) NULL,
    `kode_jiwa` INTEGER NULL,
    `penerbit_skep` VARCHAR(191) NULL,
    `npwp` VARCHAR(191) NULL,
    `no_telepon` VARCHAR(191) NULL,
    `pangkat` VARCHAR(191) NULL,
    `awal_flagging` DATETIME(3) NULL,
    `akhir_flagging` DATETIME(3) NULL,
    `mitra_flagging` VARCHAR(191) NULL,
    `keluarga` TEXT NULL,

    UNIQUE INDEX `Debitur_nopen_key`(`nopen`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dapem` (
    `id` VARCHAR(191) NOT NULL,
    `tenor` INTEGER NOT NULL,
    `plafond` INTEGER NOT NULL,
    `margin` DOUBLE NOT NULL,
    `margin_sumdan` DOUBLE NOT NULL,
    `c_adm` DOUBLE NOT NULL,
    `c_adm_sumdan` DOUBLE NOT NULL,
    `c_asuransi` DOUBLE NOT NULL,
    `c_tatalaksana` INTEGER NOT NULL,
    `c_materai` INTEGER NOT NULL,
    `c_rekening` INTEGER NOT NULL,
    `c_mutasi` INTEGER NOT NULL,
    `c_blokir` INTEGER NOT NULL,
    `c_pelunasan` INTEGER NOT NULL,
    `status_final` ENUM('DRAFT', 'ANTRI', 'PROSES', 'TRANSFER', 'LUNAS', 'GAGAL') NOT NULL DEFAULT 'DRAFT',
    `final_at` DATETIME(3) NULL,
    `verif_status` ENUM('DRAFT', 'PENDING', 'SETUJU', 'TOLAK') NULL,
    `verif_date` DATETIME(3) NULL,
    `slik_status` ENUM('DRAFT', 'PENDING', 'SETUJU', 'TOLAK') NULL,
    `slik_date` DATETIME(3) NULL,
    `approv_status` ENUM('DRAFT', 'PENDING', 'SETUJU', 'TOLAK') NULL,
    `approv_date` DATETIME(3) NULL,
    `pelunasan_status` ENUM('DRAFT', 'PENDING', 'SETUJU', 'TOLAK') NULL,
    `pelunasan_date` DATETIME(3) NULL,
    `pelunasan_ke` VARCHAR(191) NULL,
    `mutasi_status` ENUM('DRAFT', 'PENDING', 'SETUJU', 'TOLAK') NULL,
    `mutasi_date` DATETIME(3) NULL,
    `mutasi_from` VARCHAR(191) NULL,
    `mutasi_ke` VARCHAR(191) NULL,
    `tbo` INTEGER NOT NULL,
    `file_pelunasan` VARCHAR(191) NULL,
    `file_mutasi` VARCHAR(191) NULL,
    `file_slik` VARCHAR(191) NULL,
    `file_pengajuan` VARCHAR(191) NULL,
    `file_wawancara` VARCHAR(191) NULL,
    `file_asuransi` VARCHAR(191) NULL,
    `file_akad` VARCHAR(191) NULL,
    `file_pencairan` TEXT NULL,
    `video_pencairan` VARCHAR(191) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `debiturId` VARCHAR(191) NOT NULL,
    `produkPembiayaanId` VARCHAR(191) NOT NULL,
    `jenisPembiayaanId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Dapem` ADD CONSTRAINT `Dapem_debiturId_fkey` FOREIGN KEY (`debiturId`) REFERENCES `Debitur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dapem` ADD CONSTRAINT `Dapem_produkPembiayaanId_fkey` FOREIGN KEY (`produkPembiayaanId`) REFERENCES `ProdukPembiayaan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dapem` ADD CONSTRAINT `Dapem_jenisPembiayaanId_fkey` FOREIGN KEY (`jenisPembiayaanId`) REFERENCES `JenisPembiayaan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
