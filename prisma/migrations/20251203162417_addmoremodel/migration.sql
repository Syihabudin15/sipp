-- AlterTable
ALTER TABLE `dapem` ADD COLUMN `berkas_status` ENUM('CABANG', 'SENDING', 'SUMDAN', 'PUSAT') NOT NULL DEFAULT 'CABANG',
    ADD COLUMN `pencairanId` VARCHAR(191) NULL,
    ADD COLUMN `penyerahanBerkasId` VARCHAR(191) NULL,
    ADD COLUMN `penyerahanJaminanId` VARCHAR(191) NULL,
    ADD COLUMN `video_pencairan2` VARCHAR(191) NULL,
    ADD COLUMN `video_pencairan3` VARCHAR(191) NULL,
    MODIFY `file_pencairan` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Pencairan` (
    `id` VARCHAR(191) NOT NULL,
    `pencairan_status` ENUM('DRAFT', 'ANTRI', 'PROSES', 'TRANSFER', 'LUNAS', 'GAGAL') NOT NULL DEFAULT 'ANTRI',
    `pencairan_date` DATETIME(3) NULL,
    `file_si` VARCHAR(191) NULL,
    `file_proof` VARCHAR(191) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sumdanId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PenyerahanBerkas` (
    `id` VARCHAR(191) NOT NULL,
    `berkas_status` ENUM('CABANG', 'SENDING', 'SUMDAN', 'PUSAT') NOT NULL DEFAULT 'SENDING',
    `berkas_date` DATETIME(3) NULL,
    `file_si` VARCHAR(191) NULL,
    `file_proof` VARCHAR(191) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sumdanId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PenyerahanJaminan` (
    `id` VARCHAR(191) NOT NULL,
    `jaminan_status` ENUM('CABANG', 'SENDING', 'SUMDAN', 'PUSAT') NOT NULL DEFAULT 'SENDING',
    `jaminan_date` DATETIME(3) NULL,
    `file_si` VARCHAR(191) NULL,
    `file_proof` VARCHAR(191) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sumdanId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pelunasan` (
    `id` VARCHAR(191) NOT NULL,
    `nominal` INTEGER NOT NULL DEFAULT 0,
    `nominal_sumdan` INTEGER NOT NULL DEFAULT 0,
    `file_pelunasan` VARCHAR(191) NULL,
    `file_proof` VARCHAR(191) NULL,
    `pelunasan_date` DATETIME(3) NULL,
    `alasan` VARCHAR(191) NOT NULL,
    `keterangan` VARCHAR(191) NULL,
    `status_jaminan` ENUM('CABANG', 'SENDING', 'SUMDAN', 'PUSAT') NOT NULL DEFAULT 'SUMDAN',
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dapemId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Pelunasan_dapemId_key`(`dapemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Dapem` ADD CONSTRAINT `Dapem_pencairanId_fkey` FOREIGN KEY (`pencairanId`) REFERENCES `Pencairan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dapem` ADD CONSTRAINT `Dapem_penyerahanBerkasId_fkey` FOREIGN KEY (`penyerahanBerkasId`) REFERENCES `PenyerahanBerkas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dapem` ADD CONSTRAINT `Dapem_penyerahanJaminanId_fkey` FOREIGN KEY (`penyerahanJaminanId`) REFERENCES `PenyerahanJaminan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pencairan` ADD CONSTRAINT `Pencairan_sumdanId_fkey` FOREIGN KEY (`sumdanId`) REFERENCES `Sumdan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PenyerahanBerkas` ADD CONSTRAINT `PenyerahanBerkas_sumdanId_fkey` FOREIGN KEY (`sumdanId`) REFERENCES `Sumdan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PenyerahanJaminan` ADD CONSTRAINT `PenyerahanJaminan_sumdanId_fkey` FOREIGN KEY (`sumdanId`) REFERENCES `Sumdan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pelunasan` ADD CONSTRAINT `Pelunasan_dapemId_fkey` FOREIGN KEY (`dapemId`) REFERENCES `Dapem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
