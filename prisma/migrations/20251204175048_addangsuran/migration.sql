-- CreateTable
CREATE TABLE `Angsuran` (
    `id` VARCHAR(191) NOT NULL,
    `ke` INTEGER NOT NULL,
    `jadwal_bayar` DATETIME(3) NOT NULL,
    `tgl_bayar` DATETIME(3) NULL,
    `pokok` INTEGER NOT NULL,
    `margin` INTEGER NOT NULL,
    `dapemId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Angsuran` ADD CONSTRAINT `Angsuran_dapemId_fkey` FOREIGN KEY (`dapemId`) REFERENCES `Dapem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
