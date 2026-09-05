-- CreateTable
CREATE TABLE `RateBook` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RateBookAdj` (
    `id` VARCHAR(191) NOT NULL,
    `bookId` VARCHAR(191) NOT NULL,
    `metal` VARCHAR(191) NOT NULL,
    `unitKey` VARCHAR(191) NOT NULL,
    `buyDelta` DECIMAL(16, 6) NOT NULL DEFAULT 0,
    `sellDelta` DECIMAL(16, 6) NOT NULL DEFAULT 0,

    UNIQUE INDEX `RateBookAdj_bookId_metal_unitKey_key`(`bookId`, `metal`, `unitKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RateBookAdj` ADD CONSTRAINT `RateBookAdj_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `RateBook`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
