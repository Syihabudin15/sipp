-- CreateTable
CREATE TABLE `Role` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `permission` TEXT NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `nip` VARCHAR(191) NOT NULL,
    `fullname` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `target` INTEGER NOT NULL DEFAULT 0,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `roleId` VARCHAR(191) NOT NULL,
    `cabangId` VARCHAR(191) NOT NULL,
    `sumdanId` VARCHAR(191) NULL,

    UNIQUE INDEX `User_nip_key`(`nip`),
    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Area` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cabang` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `alamat` TEXT NULL,
    `no_telp` VARCHAR(191) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `areaId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sumdan` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `sk_akad` TEXT NOT NULL,
    `description` TEXT NULL,
    `logo` VARCHAR(191) NULL,
    `alamat` TEXT NULL,
    `no_telp` VARCHAR(191) NULL,
    `ttd_akad` VARCHAR(191) NULL,
    `ttd_jabatan` VARCHAR(191) NULL,
    `tbo` INTEGER NOT NULL DEFAULT 3,
    `pembulatan` INTEGER NOT NULL DEFAULT 1000,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProdukPembiayaan` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `margin` DOUBLE NOT NULL,
    `margin_sumdan` DOUBLE NOT NULL,
    `dsr` DOUBLE NOT NULL,
    `c_adm` DOUBLE NOT NULL,
    `c_adm_sumdan` DOUBLE NOT NULL,
    `c_asuransi` DOUBLE NOT NULL,
    `c_tatalaksana` INTEGER NOT NULL,
    `c_materai` INTEGER NOT NULL,
    `c_rekening` INTEGER NOT NULL,
    `max_tenor` INTEGER NOT NULL,
    `max_plafond` INTEGER NOT NULL,
    `min_usia` INTEGER NOT NULL,
    `max_usia` INTEGER NOT NULL,
    `usia_lunas` INTEGER NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sumdanId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JenisPembiayaan` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `blokir` INTEGER NOT NULL,
    `c_mutasi` INTEGER NOT NULL DEFAULT 0,
    `status_pelunasan` BOOLEAN NOT NULL DEFAULT false,
    `status_mutasi` BOOLEAN NOT NULL DEFAULT false,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Debitur` (
    `nopen` VARCHAR(191) NOT NULL,
    `gaji_pensiun` INTEGER NOT NULL,
    `nama_penerima` VARCHAR(191) NOT NULL,
    `tgl_lahir_penerima` VARCHAR(191) NOT NULL,
    `alm_peserta` VARCHAR(191) NOT NULL,
    `kelurahan` VARCHAR(191) NULL,
    `kecamatan` VARCHAR(191) NOT NULL,
    `kota` VARCHAR(191) NOT NULL,
    `provinsi` VARCHAR(191) NULL,
    `kode_pos` VARCHAR(191) NULL,
    `kantor_bayar` VARCHAR(191) NOT NULL,
    `tmt_pensiun` VARCHAR(191) NOT NULL,
    `no_skep` VARCHAR(191) NOT NULL,
    `tgl_skep` VARCHAR(191) NOT NULL,
    `nama_skep` VARCHAR(191) NULL,
    `kode_jiwa` INTEGER NULL,
    `penerbit_skep` VARCHAR(191) NULL,
    `npwp` VARCHAR(191) NULL,
    `no_telepon` VARCHAR(191) NULL,
    `pangkat` VARCHAR(191) NULL,
    `awal_flagging` VARCHAR(191) NULL,
    `akhir_flagging` VARCHAR(191) NULL,
    `mitra_flagging` VARCHAR(191) NULL,
    `kelompok_pensiun` VARCHAR(191) NULL,
    `pendidikan` VARCHAR(191) NULL,
    `jenis_kelamin` VARCHAR(191) NULL,
    `agama` VARCHAR(191) NULL,
    `nik` VARCHAR(191) NULL,
    `geo_location` VARCHAR(191) NULL,
    `d_alm_peserta` VARCHAR(191) NULL,
    `d_kelurahan` VARCHAR(191) NULL,
    `d_kecamatan` VARCHAR(191) NULL,
    `d_kota` VARCHAR(191) NULL,
    `d_provinsi` VARCHAR(191) NULL,
    `d_kode_pos` VARCHAR(191) NULL,
    `status_rumah` VARCHAR(191) NULL,
    `menempati_rumah` VARCHAR(191) NULL,
    `pekerjaan` VARCHAR(191) NULL,
    `alm_pekerjaan` VARCHAR(191) NULL,
    `ibu_kandung` VARCHAR(191) NULL,
    `jenis_usaha` VARCHAR(191) NULL,
    `status_kawin` VARCHAR(191) NULL,
    `bank` VARCHAR(191) NULL,
    `norek` VARCHAR(191) NULL,

    UNIQUE INDEX `Debitur_nopen_key`(`nopen`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `verif_desc` TEXT NULL,
    `verif_date` DATETIME(3) NULL,
    `slik_status` ENUM('DRAFT', 'PENDING', 'SETUJU', 'TOLAK') NULL,
    `slik_date` DATETIME(3) NULL,
    `slik_desc` TEXT NULL,
    `approv_status` ENUM('DRAFT', 'PENDING', 'SETUJU', 'TOLAK') NULL,
    `approv_date` DATETIME(3) NULL,
    `approv_desc` TEXT NULL,
    `pelunasan_status` ENUM('DRAFT', 'PENDING', 'SETUJU', 'TOLAK') NULL,
    `pelunasan_date` DATETIME(3) NULL,
    `pelunasan_ke` VARCHAR(191) NULL,
    `mutasi_status` ENUM('DRAFT', 'PENDING', 'SETUJU', 'TOLAK') NULL,
    `mutasi_date` DATETIME(3) NULL,
    `mutasi_from` VARCHAR(191) NULL,
    `mutasi_ke` VARCHAR(191) NULL,
    `tbo` INTEGER NOT NULL,
    `penggunaan` VARCHAR(191) NULL,
    `pembulatan` INTEGER NOT NULL,
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
    `nopen` VARCHAR(191) NOT NULL,
    `produkPembiayaanId` VARCHAR(191) NOT NULL,
    `jenisPembiayaanId` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `aoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_cabangId_fkey` FOREIGN KEY (`cabangId`) REFERENCES `Cabang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_sumdanId_fkey` FOREIGN KEY (`sumdanId`) REFERENCES `Sumdan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cabang` ADD CONSTRAINT `Cabang_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProdukPembiayaan` ADD CONSTRAINT `ProdukPembiayaan_sumdanId_fkey` FOREIGN KEY (`sumdanId`) REFERENCES `Sumdan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Keluarga` ADD CONSTRAINT `Keluarga_nopen_fkey` FOREIGN KEY (`nopen`) REFERENCES `Debitur`(`nopen`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dapem` ADD CONSTRAINT `Dapem_nopen_fkey` FOREIGN KEY (`nopen`) REFERENCES `Debitur`(`nopen`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dapem` ADD CONSTRAINT `Dapem_produkPembiayaanId_fkey` FOREIGN KEY (`produkPembiayaanId`) REFERENCES `ProdukPembiayaan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dapem` ADD CONSTRAINT `Dapem_jenisPembiayaanId_fkey` FOREIGN KEY (`jenisPembiayaanId`) REFERENCES `JenisPembiayaan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dapem` ADD CONSTRAINT `Dapem_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dapem` ADD CONSTRAINT `Dapem_aoId_fkey` FOREIGN KEY (`aoId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
