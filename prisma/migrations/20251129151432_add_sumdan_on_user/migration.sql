-- AlterTable
ALTER TABLE `user` ADD COLUMN `sumdanId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_sumdanId_fkey` FOREIGN KEY (`sumdanId`) REFERENCES `Sumdan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
